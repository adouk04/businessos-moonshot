import type { Metadata } from "next";
import { Settings } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PlannedFeature } from "@/components/planned-feature";

export const metadata: Metadata = { title: "Settings" };

export default function Page() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your business workspace and account."
      />
      <PlannedFeature
        icon={Settings}
        title="Settings is coming soon"
        phase="Phase 1"
        description="Manage your business workspace and account."
        bullets={[
      "Business profile",
      "Account and sign out",
      "Configurable return-interval fallback",
        ]}
      />
    </>
  );
}
