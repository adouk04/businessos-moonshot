import { createClient } from "@supabase/supabase-js";
import { E2E_EMAIL_DOMAIN } from "./helpers";

/**
 * Deletes throwaway users (and their businesses) created by the e2e run.
 * Only touches accounts named e2e-*@example.test. Needs the service-role key.
 */
export default async function globalTeardown() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.warn("[e2e teardown] No service-role key; test users were not cleaned up.");
    return;
  }
  const admin = createClient(url, key, { auth: { persistSession: false } });

  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error || !data.users.length) break;
    for (const user of data.users) {
      if (!user.email?.startsWith("e2e-") || !user.email.endsWith(`@${E2E_EMAIL_DOMAIN}`)) continue;
      const { data: memberships } = await admin.from("business_members").select("business_id").eq("user_id", user.id);
      for (const m of memberships ?? []) await admin.from("businesses").delete().eq("id", m.business_id);
      await admin.auth.admin.deleteUser(user.id);
    }
  }
}
