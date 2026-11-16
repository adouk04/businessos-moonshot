import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "./env";

/**
 * User-scoped Supabase client for Server Components, Server Actions and Route
 * Handlers. It runs with the signed-in user's JWT, so Postgres RLS applies.
 * Do NOT use a service-role client in request paths.
 */
export async function createClient() {
  const { url, anonKey } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component, which cannot set cookies. Safe to
          // ignore: proxy.ts refreshes the session on every request.
        }
      },
    },
  });
}
