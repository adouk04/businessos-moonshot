import type { Metadata } from "next";
import { Lightbulb } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PlannedFeature } from "@/components/planned-feature";

export const metadata: Metadata = { title: "Opportunities" };

export default function Page() {
  return (
    <>
      <PageHeader
        title="Opportunities"
        description="Find revenue you may be missing, with a clear explanation of why."
      />
      <PlannedFeature
        icon={Lightbulb}
        title="Opportunities is coming soon"
        phase="Phase 3"
        description="Find revenue you may be missing, with a clear explanation of why."
        bullets={[
      "Inactive customer detection",
      "Transparent, explainable rules",
      "Estimates labeled as estimates, never guarantees",
        ]}
      />
    </>
  );
}
