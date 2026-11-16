import type { z } from "zod";

/** Shape returned by server actions to `useActionState` forms. */
export type FormState = {
  /** Field-level messages keyed by field name. */
  errors?: Record<string, string[]>;
  /** Form-level, user-safe message. */
  message?: string;
  /** Echoed values (never passwords) so the form can repopulate. */
  values?: Record<string, string>;
} | undefined;

export function fieldErrors(error: z.ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    (out[key] ??= []).push(issue.message);
  }
  return out;
}
