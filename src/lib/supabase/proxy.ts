import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Paths reachable without a session.
const PUBLIC_PATHS = ["/", "/login", "/register"];
// Signed-in users have no reason to see these.
const AUTH_PATHS = ["/login", "/register"];

/**
 * Refreshes the Supabase session cookie and applies OPTIMISTIC redirects.
 * This is not an authorization boundary: every data access re-verifies the
 * user server-side (src/server/auth/session.ts) and RLS enforces it again.
 */
export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return new NextResponse("Server is not configured.", { status: 500 });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Validates the JWT signature and refreshes it if needed.
  const { data } = await supabase.auth.getClaims();
  const signedIn = !!data?.claims;
  const { pathname } = request.nextUrl;

  const redirectTo = (path: string) => {
    const redirect = NextResponse.redirect(new URL(path, request.url));
    // Preserve refreshed auth cookies on the redirect response.
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  };

  if (!signedIn && !PUBLIC_PATHS.includes(pathname)) return redirectTo("/login");
  if (signedIn && (pathname === "/" || AUTH_PATHS.includes(pathname))) return redirectTo("/dashboard");

  return response;
}
