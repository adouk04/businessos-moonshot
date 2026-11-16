import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Placeholder body for modules that are designed but not yet implemented.
 * Be honest in the UI: this must never imply a working feature or show fake data.
 */
export function PlannedFeature({
  icon: Icon,
  title,
  description,
  phase,
  bullets,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  phase: string;
  bullets?: string[];
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 px-6 py-14 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon className="size-6" aria-hidden />
        </span>
        <div className="space-y-1.5">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-lg font-semibold">{title}</h2>
            <Badge variant="secondary">Planned · {phase}</Badge>
          </div>
          <p className="mx-auto max-w-md text-sm text-muted-foreground">{description}</p>
        </div>
        {bullets && (
          <ul className="space-y-1 text-sm text-muted-foreground">
            {bullets.map((b) => (
              <li key={b}>• {b}</li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
