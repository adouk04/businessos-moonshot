import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { OnboardingForm } from "@/components/auth/onboarding-form";
import { createBusiness } from "@/server/actions/business";
import { getBusinessContext, requireUser } from "@/server/auth/session";

export const metadata: Metadata = { title: "Set up your business" };

// Reads the session, so it must stream behind a Suspense boundary (cacheComponents).
async function Gate() {
  await requireUser();
  if (await getBusinessContext()) redirect("/dashboard");
  return <OnboardingForm action={createBusiness} />;
}

export default function OnboardingPage() {
  return (
    <AuthCard title="Set up your business" description="Create your workspace. You can change these details later.">
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
        <Gate />
      </Suspense>
    </AuthCard>
  );
}
