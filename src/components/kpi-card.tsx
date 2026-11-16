import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/** `value` is null until real data exists; we never render placeholder numbers. */
export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | null;
  hint?: string;
  icon: LucideIcon;
}) {
  return (
    <Card>
      <CardContent className="space-y-2 p-5">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{label}</span>
          <Icon className="size-4" aria-hidden />
        </div>
        <p className="text-2xl font-semibold tabular-nums">{value ?? "—"}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}
