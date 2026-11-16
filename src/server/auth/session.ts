import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Business = {
  id: string;
  name: string;
  industry: string;
  timezone: string;
  returnIntervalFallbackDays: number;
  minVisitsForInterval: number;
};

export type BusinessContext = {
  user: { id: string; email: string | null };
  business: Business;
  role: "owner" | "staff";
};

/**
 * Current user, verified with the Supabase Auth server (not just decoded from
 * the cookie). Memoized per request. Returns null when signed out.
 */
export const getUser = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return { id: data.user.id, email: data.user.email ?? null };
});

export async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * The user's active business, resolved from membership rows. The business ID
 * is NEVER taken from the client. The MVP uses the user's oldest membership;
 * a future switcher must still verify membership here.
 */
export const getBusinessContext = cache(async (): Promise<BusinessContext | null> => {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("business_members")
    .select(
      "role, businesses ( id, name, industry, timezone, return_interval_fallback_days, min_visits_for_interval )",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("getBusinessContext failed", error.code);
    throw new Error("Could not load your business.");
  }
  const b = data?.businesses as unknown as
    | {
        id: string;
        name: string;
        industry: string;
        timezone: string;
        return_interval_fallback_days: number;
        min_visits_for_interval: number;
      }
    | null
    | undefined;
  if (!data || !b) return null;

  return {
    user,
    role: data.role as "owner" | "staff",
    business: {
      id: b.id,
      name: b.name,
      industry: b.industry,
      timezone: b.timezone,
      returnIntervalFallbackDays: b.return_interval_fallback_days,
      minVisitsForInterval: b.min_visits_for_interval,
    },
  };
});

/**
 * Authorization choke point for every business-scoped page, action and query:
 * signed in → /login; signed in without a business → /onboarding.
 */
export async function requireBusiness(): Promise<BusinessContext> {
  await requireUser();
  const ctx = await getBusinessContext();
  if (!ctx) redirect("/onboarding");
  return ctx;
}
