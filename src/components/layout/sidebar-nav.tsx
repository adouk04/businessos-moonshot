"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { brand, navSections } from "@/config/nav";
import { cn } from "@/lib/utils";

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const BrandIcon = brand.icon;

  return (
    <div className="flex h-full flex-col">
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className="flex items-center gap-2.5 px-5 py-5"
      >
        <span className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <BrandIcon className="size-4" aria-hidden />
        </span>
        <span className="text-base font-semibold tracking-tight">{brand.name}</span>
      </Link>

      <nav aria-label="Main" className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
        {navSections.map((section, i) => (
          <div key={section.label ?? i} className="space-y-1">
            {section.label && (
              <p className="px-2 pb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {section.label}
              </p>
            )}
            {section.items.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                  )}
                >
                  <item.icon className="size-4 shrink-0" aria-hidden />
                  {item.title}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <p className="border-t border-sidebar-border px-5 py-4 text-xs text-muted-foreground">
        {brand.tagline}
      </p>
    </div>
  );
}
