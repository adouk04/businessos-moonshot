# BusinessOS: Architecture

> Last updated: 2026-11-15. Describes the **target** design. Implementation status is tracked in CLAUDE.md and ROADMAP.md. At this commit only the UI shell, money helpers, and a draft schema exist.

## 1. Overview

A **modular monolith**: one Next.js application (App Router, TypeScript) talking to one Supabase project (Postgres + Auth). No microservices, queues, or separate API server.

```
Browser ──► Next.js (Vercel)
             ├─ proxy.ts            optimistic auth redirect only (not a security boundary)
             ├─ Server Components   read data via the data-access layer
             ├─ Server Actions /    mutate data: validate (Zod) → authorize → DB
             │  Route Handlers
             └─ src/domain/*        pure business logic (no I/O, no React)
                       │
                       ▼
             Supabase (Postgres + RLS + Auth)
```

## 2. Layering and module boundaries

```
src/
  app/            Routes, layouts, loading/error UI. Thin: compose components, call actions/queries.
  components/     UI only. ui/ = shadcn primitives; layout/ = shell; feature folders later.
  config/         Static config (navigation).
  domain/         PURE business rules and calculations, one folder per concept:
                    finance/   revenue, expenses, surplus, averages, top services
                    appointments/  status transitions
                    opportunities/ inactive-customer detection
                    simulation/    pricing simulator
                  No imports from React, Next, or Supabase. Fully unit-testable.
  server/         Server-only code ("server-only" import):
                    auth/      getSession(), requireBusiness() — the authorization choke point
                    db/        data-access functions (queries + mutations), one file per aggregate
                    actions/   Server Actions: parse → authorize → call db → revalidate
  lib/            Small shared utilities (money, cn, dates)
  schemas/        Zod schemas shared by forms and server actions
supabase/migrations/   SQL migrations (source of truth for the schema)
e2e/                   Playwright tests
docs/                  Project documentation
```

**Dependency rule:** `app → components, server, schemas → domain, lib`. `domain` imports nothing from the framework. `components` never import `server/db`. Calculations never live inside React components.

## 3. Data flow

**Read (e.g. dashboard):** Server Component → `requireBusiness()` (derives `businessId` from session + membership) → `server/db` fetches rows for that business (RLS also enforces) → `domain/finance` computes metrics → component renders.

**Write (e.g. record sale):** form → Server Action → Zod parse → `requireBusiness()` → `domain` rule check (e.g. status transition) → `server/db` insert → DB constraints are the last line of defense (unique sale per appointment, composite FKs) → `revalidatePath`. Errors map to user-safe messages; internals are logged server-side only.

Metrics are computed from raw rows on demand (small-business data volumes). Nothing derived is persisted, so there's no stale cache to reconcile. If volumes grow, add SQL aggregates/materialized views *behind the same domain function signatures*.

## 4. Database design

Full DDL: `supabase/migrations/0001_initial_schema.sql` (draft, not yet applied).

```
auth.users ─< business_members >─ businesses ─┬─< customers
                                              ├─< services
                                              ├─< appointments  (customer_id, service_id, price_cents snapshot, status)
                                              ├─< transactions  (kind sale|expense, amount_cents, appointment_id?, customer_id?)
                                              ├─< experiments
                                              └─< business_decisions (experiment_id?)
```

Key decisions:
- **Tenancy:** every tenant table has `business_id`. `business_members(business_id, user_id, role)` allows multiple businesses per user and multiple users per business later.
- **Composite foreign keys** `(child_id, business_id) → parent(id, business_id)` make cross-tenant references impossible at the database level.
- **Money:** `bigint` cents. `amount_cents > 0` on transactions; `kind` supplies direction.
- **Price snapshot** on appointments so editing a service price never rewrites history or revenue estimates.
- **Duplicate-sale prevention:** partial unique index on `transactions(appointment_id) where kind='sale'`.
- **Time:** `appointments.starts_at` is `timestamptz`; `transactions.occurred_on` is a `date` in the business's timezone (`businesses.timezone`). "Days since last visit" is computed in the business timezone.
- **Indexes** lead with `business_id` to match every query's filter.
- **Derived data is not stored:** opportunities and simulations are computed on demand.
- **Experiments/decisions** store free-text outcome fields; values like baseline are text in MVP because metrics are heterogeneous (revisit with typed metrics post-MVP).

## 5. Security model

Defense in depth, in this order:

1. **Authentication:** Supabase Auth; session in HTTP-only cookies via `@supabase/ssr`.
2. **`proxy.ts`:** optimistic redirect for unauthenticated users. Documented by Next.js as *not* a full authorization solution; never relied upon.
3. **Server authorization:** every server action / data function starts with `requireBusiness()`, which resolves the user's active business from `business_members`. Client-provided business IDs are never trusted; if one is accepted (future business switcher) it is verified against membership.
4. **RLS:** every tenant table enabled with `is_business_member(business_id)` policies for select/insert/update/delete (including `WITH CHECK`). Server code uses the **user-scoped** Supabase client so RLS applies.
5. **Service-role key:** server-only, never `NEXT_PUBLIC_`, never used in request paths that act on behalf of a user except for narrowly scoped admin tasks (e.g. seeding). Not used at all in the MVP request path.
6. **Validation:** Zod on every external input (forms, query params, route handlers).
7. **Errors:** user-safe messages; no stack traces or SQL to the client.
8. **AI boundary:** AI (stretch) receives computed, aggregate figures and returns prose. It never writes SQL, never calculates, never gets raw rows beyond what the owner is already viewing.
9. **Secrets:** `.env.local` only, variable names documented in README.md; `.gitignore` excludes real env files.

**Authorization test plan:** integration tests create two users/businesses and assert user A gets zero rows and failed writes against B's data on every table, plus cross-tenant FK insertion failure.

## 6. Business rules (pure domain functions)

**Appointment status transitions**

| From \ To | scheduled | completed | cancelled | no_show |
|---|---|---|---|---|
| scheduled | n/a | ✅ | ✅ | ✅ |
| completed | ❌ | n/a | ❌ | ❌ |
| cancelled | ✅ (reschedule/undo) | ❌ | n/a | ❌ |
| no_show | ✅ (correction) | ✅ (correction) | ❌ | n/a |

Re-submitting the same status is an idempotent no-op (never an error, never a second side effect). Completion never creates a transaction.

**Finance:** `revenue = Σ sale.amount_cents`, `expenses = Σ expense.amount_cents`, `surplus = revenue − expenses` (all within the date range, inclusive), `average transaction = revenue / count(sales)` using integer division with explicit rounding (round half up), `null` when there are no sales.

**Opportunities:** rules in PRD M7. Pure function `detectInactiveCustomers(history, settings, now) → Opportunity[]` where each result includes `reason` text and the inputs that produced it.

**Pricing simulator:** pure function over integer cents and integer-percent/basis-point inputs; scenarios are three parameter sets run through the same function.

## 6a. Pricing simulation math (reference)

Let `p0` current price, `v0` baseline volume per period, `c` variable cost per unit (0 if unknown), `Δp` price change %, `Δd` demand change %.
`p1 = p0·(1+Δp)`, `v1 = v0·(1+Δd)`.
Revenue: `R0 = p0·v0`, `R1 = p1·v1`. Contribution: `C0 = (p0−c)·v0`, `C1 = (p1−c)·v1`.
Break-even volume (to match current contribution): `v* = C0 / (p1−c)` when `p1 > c`, else undefined.
Rounding happens once, at the end, in integer cents.

## 7. Frontend architecture

- Next.js App Router with a `(app)` route group for the authenticated shell (sidebar + header); public routes (landing, login, register) get their own group in Phase 1.
- Server Components by default; Client Components only for interactivity (nav highlighting, theme toggle, forms, charts).
- shadcn/ui primitives (Base UI under the hood) + Tailwind v4 theme tokens in `globals.css`; light/dark via a `dark` class set before first paint.
- Recharts for charts (client components fed by server-computed series).
- Loading (`loading.tsx`) and error (`error.tsx`) boundaries at the `(app)` level; helpful empty states per module; no placeholder numbers (`KpiCard` renders "—" for null).

## 8. Testing strategy

| Layer | Tool | What |
|---|---|---|
| Pure domain | Vitest | Revenue/expense math, simulator, inactive-customer rules, status transitions, money helpers |
| Validation | Vitest | Zod schemas |
| Authorization | Vitest + real Postgres (Supabase local or test project) | RLS isolation, composite FK, duplicate-sale index |
| End to end | Playwright (desktop + mobile projects) | Sign-up → onboarding → core flows |

## 9. Deployment

Vercel (app) + Supabase (database/auth). Environments: local, production (preview optional). Public deployment and any paid tier require explicit owner approval.

## 10. Known risks

See DECISIONS.md (ADR-009) for the risk register with mitigations.
