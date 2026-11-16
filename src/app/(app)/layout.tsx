import { MobileNav } from "@/components/layout/mobile-nav";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";

// Phase 1: this layout will require an authenticated user + active business
// workspace (server-side) before rendering children.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen md:grid md:grid-cols-[16rem_1fr]">
      <aside className="sticky top-0 hidden h-screen border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:block">
        <SidebarNav />
      </aside>
      <div className="flex min-w-0 flex-col">
        <header className="flex h-14 items-center justify-between gap-2 border-b px-4 md:justify-end md:px-8">
          <MobileNav />
          <ThemeToggle />
        </header>
        <main id="main" className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
