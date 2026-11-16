"use client";

import { Button } from "@/components/ui/button";

// Never render error.message: it can leak internals. Log server-side instead.
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-24 text-center" role="alert">
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        We couldn&apos;t load this page. Please try again.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
