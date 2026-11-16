import type { Metadata } from "next";
import { Wallet } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PlannedFeature } from "@/components/planned-feature";

export const metadata: Metadata = { title: "Finances" };

export default function Page() {
  return (
    <>
      <PageHeader
        title="Finances"
        description="Record sales and expenses and review your transaction history."
      />
      <PlannedFeature
        icon={Wallet}
        title="Finances is coming soon"
        phase="Phase 2"
        description="Record sales and expenses and review your transaction history."
        bullets={[
      "Record sales and categorized expenses",
      "Filter by date",
      "Link sales to appointments",
        ]}
      />
    </>
  );
}
