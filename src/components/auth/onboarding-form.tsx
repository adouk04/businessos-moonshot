"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { INDUSTRIES } from "@/schemas/business";
import type { FormState } from "@/schemas/form";

export function OnboardingForm({
  action,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="name">Business name</Label>
        <Input
          id="name"
          name="name"
          autoComplete="organization"
          defaultValue={state?.values?.name}
          aria-invalid={!!state?.errors?.name}
          aria-describedby={state?.errors?.name ? "name-error" : undefined}
          required
        />
        {state?.errors?.name && (
          <p id="name-error" className="text-sm text-destructive">
            {state.errors.name[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="industry">Industry</Label>
        <select
          id="industry"
          name="industry"
          defaultValue={state?.values?.industry ?? ""}
          aria-invalid={!!state?.errors?.industry}
          aria-describedby={state?.errors?.industry ? "industry-error" : undefined}
          required
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
        >
          <option value="" disabled>
            Select…
          </option>
          {INDUSTRIES.map((i) => (
            <option key={i.value} value={i.value}>
              {i.label}
            </option>
          ))}
        </select>
        {state?.errors?.industry && (
          <p id="industry-error" className="text-sm text-destructive">
            {state.errors.industry[0]}
          </p>
        )}
      </div>

      {state?.message && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Creating…" : "Create workspace"}
      </Button>
    </form>
  );
}
