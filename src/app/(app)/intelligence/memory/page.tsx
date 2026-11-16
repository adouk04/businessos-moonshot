import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PlannedFeature } from "@/components/planned-feature";

export const metadata: Metadata = { title: "Business Memory" };

export default function Page() {
  return (
    <>
      <PageHeader
        title="Business Memory"
        description="A log of important decisions, why you made them, and how they turned out."
      />
      <PlannedFeature
        icon={BookOpen}
        title="Business Memory is coming soon"
        phase="Phase 3"
        description="A log of important decisions, why you made them, and how they turned out."
        bullets={[
      "Decision, reason, expected and observed result",
      "Link to related experiments",
        ]}
      />
    </>
  );
}
