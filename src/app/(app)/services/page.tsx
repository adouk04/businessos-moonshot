import type { Metadata } from "next";
import { Tags } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PlannedFeature } from "@/components/planned-feature";

export const metadata: Metadata = { title: "Services" };

export default function Page() {
  return (
    <>
      <PageHeader
        title="Services"
        description="Define what you offer, what it costs, and how long it takes."
      />
      <PlannedFeature
        icon={Tags}
        title="Services is coming soon"
        phase="Phase 2"
        description="Define what you offer, what it costs, and how long it takes."
        bullets={[
      "Name, price, and estimated duration",
      "Activate or deactivate services",
        ]}
      />
    </>
  );
}
