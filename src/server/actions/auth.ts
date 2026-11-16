"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signInSchema, signUpSchema } from "@/schemas/auth";
import { fieldErrors, type FormState } from "@/schemas/form";

export async function signUp(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = { email: String(formData.get("email") ?? ""), password: String(formData.get("password") ?? "") };
  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error), values: { email: raw.email } };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp(parsed.data);

  if (error) {
    console.error("signUp failed", error.code ?? error.status);
    const message =
      error.code === "user_already_exists" || error.code === "email_exists"
        ? "An account with this email already exists. Try signing in."
        : error.code === "weak_password"
          ? "That password is too weak. Try a longer one."
          : "We couldn't create your account. Please try again.";
    return { message, values: { email: raw.email } };
  }

  // With email confirmation on, there is no session yet.
  if (!data.session) {
    return { message: "Check your email to confirm your account, then sign in.", values: { email: raw.email } };
  }
  redirect("/onboarding");
}

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = { email: String(formData.get("email") ?? ""), password: String(formData.get("password") ?? "") };
  const parsed = signInSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error), values: { email: raw.email } };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    // Same message for wrong password and unknown email: no account enumeration.
    return { message: "Invalid email or password.", values: { email: raw.email } };
  }
  redirect("/dashboard");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
