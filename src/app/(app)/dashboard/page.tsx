import type { Metadata } from "next";
import { CalendarCheck, CalendarDays, DollarSign, Receipt, TrendingUp, Wallet } from "lucide-react";
import { KpiCard } from "@/components/kpi-card";
import { PageHeader } from "@/components/page-header";
import { PlannedFeature } from "@/components/planned-feature";

export const metadata: Metadata = { title: "Dashboard" };

// Scaffold only: values are null (rendered as "—") until Phase 2 computes them
// from real database records. No sample numbers are shown.
export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="How your business is performing. Metrics are calculated from your recorded sales, expenses, and appointments."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard label="Total revenue" value={null} icon={DollarSign} hint="From recorded sales" />
        <KpiCard label="Recorded expenses" value={null} icon={Receipt} hint="From recorded expenses" />
        <KpiCard
          label="Estimated operating surplus"
          value={null}
          icon={Wallet}
          hint="Revenue minus recorded expenses. Not accounting net profit."
        />
        <KpiCard label="Appointments" value={null} icon={CalendarDays} />
        <KpiCard label="Completed" value={null} icon={CalendarCheck} />
        <KpiCard label="Average transaction" value={null} icon={TrendingUp} />
      </div>
      <PlannedFeature
        icon={TrendingUp}
        title="Revenue trends and top services"
        phase="Phase 2"
        description="Charts and date filters will appear here once sales and expenses can be recorded."
      />
    </>
  );
}
