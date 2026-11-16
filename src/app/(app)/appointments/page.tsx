import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PlannedFeature } from "@/components/planned-feature";

export const metadata: Metadata = { title: "Appointments" };

export default function Page() {
  return (
    <>
      <PageHeader
        title="Appointments"
        description="Schedule and manage upcoming appointments."
      />
      <PlannedFeature
        icon={CalendarDays}
        title="Appointments is coming soon"
        phase="Phase 2"
        description="Schedule and manage upcoming appointments."
        bullets={[
      "Create appointments for customers and services",
      "Scheduled, completed, cancelled, no-show",
      "Reliable list view first; calendar later",
        ]}
      />
    </>
  );
}
