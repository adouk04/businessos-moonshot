import type { Metadata } from "next";
import { FlaskConical } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PlannedFeature } from "@/components/planned-feature";

export const metadata: Metadata = { title: "Experiments" };

export default function Page() {
  return (
    <>
      <PageHeader
        title="Experiments"
        description="Plan growth experiments and compare expected results with what happened."
      />
      <PlannedFeature
        icon={FlaskConical}
        title="Experiments is coming soon"
        phase="Phase 3"
        description="Plan growth experiments and compare expected results with what happened."
        bullets={[
      "Hypothesis, dates, target metric, baseline",
      "Manual outcome entry",
        ]}
      />
    </>
  );
}
