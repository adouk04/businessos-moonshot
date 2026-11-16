/**
 * Integration tests for business-level data isolation (RLS + constraints).
 * They run against a REAL Supabase project, so they are skipped unless these
 * variables are set in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
 * The service-role key is used ONLY here, to create and delete throwaway users.
 * Everything under test runs as signed-in, user-scoped clients, like the app.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const enabled = !!(url && anonKey && serviceKey);

if (!enabled) {
  console.warn("[rls.integration] SKIPPED: Supabase env vars not set. Isolation is NOT verified in this run.");
}

type Tenant = { userId: string; email: string; client: SupabaseClient; businessId: string };

describe.skipIf(!enabled)("business-level isolation (RLS)", () => {
  const admin = enabled ? createClient(url!, serviceKey!, { auth: { persistSession: false } }) : (null as never);
  const run = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const password = `Test-${run}-pw!`;
  let A: Tenant;
  let B: Tenant;

  async function makeTenant(label: string): Promise<Tenant> {
    const email = `rls-${label}-${run}@example.test`;
    const created = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    if (created.error || !created.data.user) throw new Error(`createUser failed: ${created.error?.message}`);

    const client = createClient(url!, anonKey!, { auth: { persistSession: false } });
    const signedIn = await client.auth.signInWithPassword({ email, password });
    if (signedIn.error) throw new Error(`sign in failed: ${signedIn.error.message}`);

    const rpc = await client.rpc("create_business", { p_name: `Biz ${label} ${run}`, p_industry: "other" });
    if (rpc.error || !rpc.data) throw new Error(`create_business failed: ${rpc.error?.message}`);
    return { userId: created.data.user.id, email, client, businessId: rpc.data as string };
  }

  async function insertCustomer(t: Tenant, name = "Cust") {
    const r = await t.client
      .from("customers")
      .insert({ business_id: t.businessId, name })
      .select("id")
      .single();
    if (r.error) throw new Error(`customer insert failed: ${r.error.message}`);
    return r.data.id as string;
  }

  async function insertService(t: Tenant) {
    const r = await t.client
      .from("services")
      .insert({ business_id: t.businessId, name: "Cut", price_cents: 3000, duration_minutes: 30 })
      .select("id")
      .single();
    if (r.error) throw new Error(`service insert failed: ${r.error.message}`);
    return r.data.id as string;
  }

  async function insertAppointment(t: Tenant, customerId: string, serviceId: string) {
    return t.client
      .from("appointments")
      .insert({
        business_id: t.businessId,
        customer_id: customerId,
        service_id: serviceId,
        starts_at: new Date().toISOString(),
        price_cents: 3000,
      })
      .select("id")
      .single();
  }

  beforeAll(async () => {
    A = await makeTenant("a");
    B = await makeTenant("b");
  }, 60_000);

  afterAll(async () => {
    // Businesses first (cascades to tenant rows and memberships), then users.
    for (const t of [A, B]) {
      if (!t) continue;
      await admin.from("businesses").delete().eq("id", t.businessId);
      await admin.auth.admin.deleteUser(t.userId);
    }
  }, 60_000);

  it("each user sees only their own business", async () => {
    const a = await A.client.from("businesses").select("id");
    const b = await B.client.from("businesses").select("id");
    expect(a.data?.map((r) => r.id)).toEqual([A.businessId]);
    expect(b.data?.map((r) => r.id)).toEqual([B.businessId]);
  });

  it("a user cannot read another business's customers", async () => {
    const custA = await insertCustomer(A, "Secret A");
    const asB = await B.client.from("customers").select("id").eq("id", custA);
    expect(asB.error).toBeNull();
    expect(asB.data).toEqual([]);
    const all = await B.client.from("customers").select("id");
    expect(all.data?.some((r) => r.id === custA)).toBe(false);
  });

  it("a user cannot insert rows into another business", async () => {
    const r = await B.client.from("customers").insert({ business_id: A.businessId, name: "Intruder" });
    expect(r.error).not.toBeNull();
    const s = await B.client
      .from("services")
      .insert({ business_id: A.businessId, name: "X", price_cents: 1, duration_minutes: 5 });
    expect(s.error).not.toBeNull();
  });

  it("a user cannot update or delete another business's rows (no rows affected)", async () => {
    const custA = await insertCustomer(A, "Keep me");
    const upd = await B.client.from("customers").update({ name: "Hacked" }).eq("id", custA).select("id");
    expect(upd.data ?? []).toEqual([]);
    const del = await B.client.from("customers").delete().eq("id", custA).select("id");
    expect(del.data ?? []).toEqual([]);

    const check = await admin.from("customers").select("name").eq("id", custA).single();
    expect(check.data?.name).toBe("Keep me");
  });

  it("a user cannot move their own row into another business", async () => {
    const custA = await insertCustomer(A, "Mover");
    const r = await A.client.from("customers").update({ business_id: B.businessId }).eq("id", custA).select("id");
    expect(r.error !== null || (r.data ?? []).length === 0).toBe(true);
    const check = await admin.from("customers").select("business_id").eq("id", custA).single();
    expect(check.data?.business_id).toBe(A.businessId);
  });

  it("composite FKs reject linking another business's customer to an appointment", async () => {
    const custB = await insertCustomer(B, "B's customer");
    const svcA = await insertService(A);
    const r = await insertAppointment(A, custB, svcA);
    expect(r.error).not.toBeNull();
    expect(r.error?.code).toBe("23503"); // foreign_key_violation
  });

  it("prevents duplicate sales for the same appointment (DB-enforced)", async () => {
    const cust = await insertCustomer(A, "Pays once");
    const svc = await insertService(A);
    const appt = await insertAppointment(A, cust, svc);
    expect(appt.error).toBeNull();
    const apptId = appt.data!.id as string;

    const sale = () =>
      A.client.from("transactions").insert({
        business_id: A.businessId,
        kind: "sale",
        amount_cents: 3000,
        occurred_on: "2026-12-01",
        appointment_id: apptId,
        customer_id: cust,
      });
    expect((await sale()).error).toBeNull();
    const dup = await sale();
    expect(dup.error?.code).toBe("23505"); // unique_violation
  });

  it("rejects expenses linked to an appointment or customer", async () => {
    const cust = await insertCustomer(A, "Nope");
    const r = await A.client.from("transactions").insert({
      business_id: A.businessId,
      kind: "expense",
      amount_cents: 500,
      occurred_on: "2026-12-01",
      customer_id: cust,
    });
    expect(r.error?.code).toBe("23514"); // check_violation
  });

  it("rejects non-positive money amounts", async () => {
    const r = await A.client.from("transactions").insert({
      business_id: A.businessId,
      kind: "expense",
      amount_cents: 0,
      occurred_on: "2026-12-01",
    });
    expect(r.error?.code).toBe("23514");
  });

  it("direct inserts into businesses and business_members are denied", async () => {
    const biz = await A.client.from("businesses").insert({ name: "Rogue" });
    expect(biz.error).not.toBeNull();
    const mem = await A.client
      .from("business_members")
      .insert({ business_id: B.businessId, user_id: A.userId, role: "owner" });
    expect(mem.error).not.toBeNull();
    // A must not have gained access to B's data.
    const peek = await A.client.from("customers").select("id").eq("business_id", B.businessId);
    expect(peek.data).toEqual([]);
  });

  it("anonymous (signed-out) clients see nothing and cannot create a business", async () => {
    const anon = createClient(url!, anonKey!, { auth: { persistSession: false } });
    const rows = await anon.from("customers").select("id");
    expect(rows.data ?? []).toEqual([]);
    const rpc = await anon.rpc("create_business", { p_name: "Nope", p_industry: "other" });
    expect(rpc.error).not.toBeNull();
  });
});
