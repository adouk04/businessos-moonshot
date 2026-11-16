-- BusinessOS initial schema (DRAFT: not yet applied to any database).
-- Status: designed in the scaffold phase; will be applied and tested in Phase 1.
-- See docs/ARCHITECTURE.md for the rationale behind each decision.
--
-- Conventions:
--   * Every tenant-owned table carries business_id and has RLS enabled.
--   * Money is integer cents (bigint). Never numeric/float.
--   * Timestamps are timestamptz, default now(), in UTC.
--   * Cross-table references include business_id in a composite FK so a row can
--     never point at another tenant's row, even if application code is buggy.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Tenancy: businesses and membership
-- ---------------------------------------------------------------------------

create table businesses (
  id            uuid primary key default gen_random_uuid(),
  name          text not null check (char_length(name) between 1 and 120),
  industry      text not null default 'other',  -- free text; no industry-specific behavior is hardcoded
  timezone      text not null default 'America/Los_Angeles',
  -- Revenue Recovery Engine configuration (Module 7)
  return_interval_fallback_days int not null default 45 check (return_interval_fallback_days between 1 and 730),
  min_visits_for_interval       int not null default 3  check (min_visits_for_interval between 2 and 50),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table business_members (
  business_id uuid not null references businesses(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null default 'owner' check (role in ('owner', 'staff')),
  created_at  timestamptz not null default now(),
  primary key (business_id, user_id)
);
create index business_members_user_idx on business_members (user_id);

-- Membership check used by every RLS policy. SECURITY DEFINER so it can read
-- business_members without recursing through that table's own policies.
create or replace function is_business_member(target_business uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from business_members
    where business_id = target_business and user_id = auth.uid()
  );
$$;

-- Atomic onboarding: create the business and make the caller its owner.
-- Direct INSERT on businesses is not allowed by RLS; this is the only path.
create or replace function create_business(p_name text, p_industry text)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  new_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  insert into businesses (name, industry)
    values (p_name, coalesce(nullif(p_industry, ''), 'other'))
    returning id into new_id;
  insert into business_members (business_id, user_id, role)
    values (new_id, auth.uid(), 'owner');
  return new_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Operations: customers, services, appointments, transactions
-- ---------------------------------------------------------------------------

create table customers (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 160),
  email       text check (email is null or char_length(email) <= 254),
  phone       text check (phone is null or char_length(phone) <= 40),
  notes       text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (id, business_id)
);
create index customers_business_name_idx on customers (business_id, name);

create table services (
  id               uuid primary key default gen_random_uuid(),
  business_id      uuid not null references businesses(id) on delete cascade,
  name             text not null check (char_length(name) between 1 and 160),
  price_cents      bigint not null check (price_cents >= 0),
  duration_minutes int not null check (duration_minutes between 1 and 1440),
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (id, business_id)
);
create index services_business_active_idx on services (business_id, is_active);

create table appointments (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references businesses(id) on delete cascade,
  customer_id  uuid not null,
  service_id   uuid not null,
  starts_at    timestamptz not null,
  -- Price snapshot at booking time so later service price edits don't rewrite history.
  price_cents  bigint not null check (price_cents >= 0),
  status       text not null default 'scheduled'
               check (status in ('scheduled', 'completed', 'cancelled', 'no_show')),
  notes        text not null default '',
  completed_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (id, business_id),
  foreign key (customer_id, business_id) references customers (id, business_id),
  foreign key (service_id,  business_id) references services  (id, business_id)
);
create index appointments_business_starts_idx on appointments (business_id, starts_at desc);
create index appointments_customer_idx        on appointments (business_id, customer_id, starts_at desc);
create index appointments_business_status_idx on appointments (business_id, status);

-- One ledger for money in and out. Marking an appointment completed does NOT
-- create a row here; the owner records payment explicitly (PRD Module 5).
create table transactions (
  id             uuid primary key default gen_random_uuid(),
  business_id    uuid not null references businesses(id) on delete cascade,
  kind           text not null check (kind in ('sale', 'expense')),
  amount_cents   bigint not null check (amount_cents > 0),  -- always positive; kind gives the direction
  occurred_on    date not null,
  category       text,                -- expenses: rent, supplies, etc.
  description    text not null default '',
  appointment_id uuid,                -- sales only, optional
  customer_id    uuid,                -- sales only, optional
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  foreign key (appointment_id, business_id) references appointments (id, business_id),
  foreign key (customer_id,    business_id) references customers    (id, business_id),
  check (kind = 'sale' or (appointment_id is null and customer_id is null))
);
create index transactions_business_date_idx on transactions (business_id, occurred_on desc);
create index transactions_business_kind_idx on transactions (business_id, kind, occurred_on desc);
-- Duplicate-sale prevention: at most one sale per appointment, enforced by the
-- database and not only by application code. Relax later if split payments are needed.
create unique index transactions_one_sale_per_appointment
  on transactions (appointment_id) where kind = 'sale' and appointment_id is not null;

-- ---------------------------------------------------------------------------
-- Intelligence: experiments and business memory
-- (Opportunities and simulations are computed on demand in the MVP; nothing
--  derived is persisted, so there is no stale data to reconcile.)
-- ---------------------------------------------------------------------------

create table experiments (
  id               uuid primary key default gen_random_uuid(),
  business_id      uuid not null references businesses(id) on delete cascade,
  name             text not null check (char_length(name) between 1 and 160),
  hypothesis       text not null default '',
  start_date       date,
  end_date         date,
  target_metric    text not null default '',
  baseline_value   text not null default '',
  proposed_action  text not null default '',
  expected_outcome text not null default '',
  actual_outcome   text not null default '',
  status           text not null default 'draft' check (status in ('draft', 'active', 'completed', 'cancelled')),
  notes            text not null default '',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (id, business_id),
  check (end_date is null or start_date is null or end_date >= start_date)
);
create index experiments_business_status_idx on experiments (business_id, status);

create table business_decisions (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid not null references businesses(id) on delete cascade,
  decision        text not null check (char_length(decision) between 1 and 300),
  reason          text not null default '',
  decided_on      date not null,
  expected_result text not null default '',
  observed_result text not null default '',
  experiment_id   uuid,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  foreign key (experiment_id, business_id) references experiments (id, business_id)
);
create index business_decisions_business_date_idx on business_decisions (business_id, decided_on desc);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

do $$
declare t text;
begin
  foreach t in array array['businesses','customers','services','appointments','transactions','experiments','business_decisions']
  loop
    execute format('create trigger %I before update on %I for each row execute function set_updated_at()', t || '_updated_at', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------

alter table businesses          enable row level security;
alter table business_members    enable row level security;
alter table customers           enable row level security;
alter table services            enable row level security;
alter table appointments        enable row level security;
alter table transactions        enable row level security;
alter table experiments         enable row level security;
alter table business_decisions  enable row level security;

-- businesses: members may read and update; creation only via create_business(); no delete in MVP.
create policy businesses_select on businesses for select to authenticated using (is_business_member(id));
create policy businesses_update on businesses for update to authenticated
  using (is_business_member(id)) with check (is_business_member(id));

-- business_members: users may see their own memberships. Writes only via security-definer functions.
create policy members_select_own on business_members for select to authenticated using (user_id = auth.uid());

-- Tenant-owned tables: full CRUD for members of the owning business.
-- WITH CHECK stops a member from inserting or moving rows into someone else's business.
do $$
declare t text;
begin
  foreach t in array array['customers','services','appointments','transactions','experiments','business_decisions']
  loop
    execute format('create policy %I on %I for select to authenticated using (is_business_member(business_id))', t || '_select', t);
    execute format('create policy %I on %I for insert to authenticated with check (is_business_member(business_id))', t || '_insert', t);
    execute format('create policy %I on %I for update to authenticated using (is_business_member(business_id)) with check (is_business_member(business_id))', t || '_update', t);
    execute format('create policy %I on %I for delete to authenticated using (is_business_member(business_id))', t || '_delete', t);
  end loop;
end $$;

-- Restrict function execution to signed-in users.
revoke all on function create_business(text, text) from public;
grant execute on function create_business(text, text) to authenticated;
revoke all on function is_business_member(uuid) from public;
grant execute on function is_business_member(uuid) to authenticated;
