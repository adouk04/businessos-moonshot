import type { ReactNode } from "react";
import { brand } from "@/config/nav";
import { Card, CardContent } from "@/components/ui/card";

export function AuthCard({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  const BrandIcon = brand.icon;
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <BrandIcon className="size-5" aria-hidden />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Card>
          <CardContent className="p-6">{children}</CardContent>
        </Card>
      </div>
    </main>
  );
}
