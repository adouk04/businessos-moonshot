import type { Metadata } from "next";
import { SlidersHorizontal } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PlannedFeature } from "@/components/planned-feature";

export const metadata: Metadata = { title: "Decision Simulator" };

export default function Page() {
  return (
    <>
      <PageHeader
        title="Decision Simulator"
        description="Model a pricing change before you make it."
      />
      <PlannedFeature
        icon={SlidersHorizontal}
        title="Decision Simulator is coming soon"
        phase="Phase 3"
        description="Model a pricing change before you make it."
        bullets={[
      "Pricing simulator with optimistic, baseline, pessimistic scenarios",
      "Deterministic calculations; hypothetical results clearly labeled",
        ]}
      />
    </>
  );
}
