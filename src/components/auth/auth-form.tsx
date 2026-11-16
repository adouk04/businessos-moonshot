"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormState } from "@/schemas/form";

type Props = {
  mode: "login" | "register";
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
};

export function AuthForm({ mode, action }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const isLogin = mode === "login";

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state?.values?.email}
          aria-invalid={!!state?.errors?.email}
          aria-describedby={state?.errors?.email ? "email-error" : undefined}
          required
        />
        {state?.errors?.email && (
          <p id="email-error" className="text-sm text-destructive">
            {state.errors.email[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={isLogin ? "current-password" : "new-password"}
          aria-invalid={!!state?.errors?.password}
          aria-describedby={state?.errors?.password ? "password-error" : isLogin ? undefined : "password-hint"}
          required
        />
        {state?.errors?.password ? (
          <p id="password-error" className="text-sm text-destructive">
            {state.errors.password[0]}
          </p>
        ) : (
          !isLogin && (
            <p id="password-hint" className="text-xs text-muted-foreground">
              At least 8 characters.
            </p>
          )
        )}
      </div>

      {state?.message && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Please wait…" : isLogin ? "Sign in" : "Create account"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {isLogin ? (
          <>
            New to BusinessOS?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
