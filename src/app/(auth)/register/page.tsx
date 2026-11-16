import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthForm } from "@/components/auth/auth-form";
import { signUp } from "@/server/actions/auth";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <AuthCard title="Create your account" description="Manage smarter. Grow faster.">
      <AuthForm mode="register" action={signUp} />
    </AuthCard>
  );
}
