import type { Metadata } from "next";
import { Users } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PlannedFeature } from "@/components/planned-feature";

export const metadata: Metadata = { title: "Customers" };

export default function Page() {
  return (
    <>
      <PageHeader
        title="Customers"
        description="Keep track of the people you serve and spot who hasn't returned."
      />
      <PlannedFeature
        icon={Users}
        title="Customers is coming soon"
        phase="Phase 2"
        description="Keep track of the people you serve and spot who hasn't returned."
        bullets={[
      "Create and edit customers",
      "Search and filter",
      "Appointment and transaction history",
        ]}
      />
    </>
  );
}
