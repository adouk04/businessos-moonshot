import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthForm } from "@/components/auth/auth-form";
import { signIn } from "@/server/actions/auth";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <AuthCard title="Welcome back" description="Sign in to your BusinessOS account.">
      <AuthForm mode="login" action={signIn} />
    </AuthCard>
  );
}
