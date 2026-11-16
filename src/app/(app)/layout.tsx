import { Suspense } from "react";
import { LogOut } from "lucide-react";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { signOut } from "@/server/actions/auth";
import { requireBusiness } from "@/server/auth/session";

// Reads the session (request-time data), so it streams behind Suspense.
// requireBusiness() is the authorization gate for every page in this group:
// signed out -> /login, no business yet -> /onboarding.
async function AuthedHeaderInfo() {
  const { business, user } = await requireBusiness();
  return (
    <div className="flex min-w-0 flex-col text-right leading-tight">
      <span className="truncate text-sm font-medium" data-testid="business-name">
        {business.name}
      </span>
      <span className="truncate text-xs text-muted-foreground">{user.email}</span>
    </div>
  );
}

async function Gate({ children }: { children: React.ReactNode }) {
  await requireBusiness();
  return <>{children}</>;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen md:grid md:grid-cols-[16rem_1fr]">
      <aside className="sticky top-0 hidden h-screen border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:block">
        <SidebarNav />
      </aside>
      <div className="flex min-w-0 flex-col">
        <header className="flex h-14 items-center justify-between gap-2 border-b px-4 md:justify-end md:px-8">
          <MobileNav />
          <div className="flex items-center gap-2">
            <Suspense fallback={<Skeleton className="h-8 w-32" />}>
              <AuthedHeaderInfo />
            </Suspense>
            <ThemeToggle />
            <form action={signOut}>
              <Button type="submit" variant="ghost" size="icon" aria-label="Sign out">
                <LogOut className="size-4" aria-hidden />
              </Button>
            </form>
          </div>
        </header>
        <main id="main" className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-6 md:px-8 md:py-8">
          <Suspense fallback={<Skeleton className="h-64" />}>
            <Gate>{children}</Gate>
          </Suspense>
        </main>
      </div>
    </div>
  );
}
