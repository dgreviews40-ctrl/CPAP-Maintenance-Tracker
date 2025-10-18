"use client";

import MaintenanceTracker from "@/components/MaintenanceTracker";
import DashboardSummary from "@/components/DashboardSummary";
import Layout from "@/components/Layout";
import DashboardLayout from "@/components/DashboardLayout";
import MaintenanceForecastChart from "@/components/MaintenanceForecastChart";
import UpcomingTasks from "@/components/UpcomingTasks";
import LowInventoryWidget from "@/components/LowInventoryWidget";
import InventoryStatusChart from "@/components/InventoryStatusChart";
import PartUsageRateChart from "@/components/PartUsageRateChart";
import NotificationCenter from "@/components/NotificationCenter";
import { Separator } from "@/components/ui/separator";

const DashboardSidebar = () => (
  <div className="space-y-6">
    <DashboardSummary />
    <UpcomingTasks />
    <LowInventoryWidget />
    <MaintenanceForecastChart />
    <InventoryStatusChart />
    <PartUsageRateChart />
    <NotificationCenter />
  </div>
);

const Index = () => {
  return (
    <Layout>
      <div className="container mx-auto p-4">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold">CPAP Maintenance Hub</h1>
          <p className="text-xl text-muted-foreground">
            Keep your CPAP machine running smoothly.
          </p>
        </header>
        <main className="w-full max-w-6xl mx-auto">
          <DashboardLayout sidebar={<DashboardSidebar />}>
            <h2 className="text-3xl font-bold mb-4">Maintenance Tracker</h2>
            <Separator className="mb-6" />
            <MaintenanceTracker />
          </DashboardLayout>
        </main>
      </div>
    </Layout>
  );
};

export default Index;