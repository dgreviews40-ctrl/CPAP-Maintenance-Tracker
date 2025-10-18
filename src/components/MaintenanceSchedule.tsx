"use client";

import MaintenanceTracker from "@/components/MaintenanceTracker";
import DashboardSummary from "./DashboardSummary";
import InventoryAlert from "./InventoryAlert";
import UpcomingTasks from "./UpcomingTasks";
import LowInventoryWidget from "./LowInventoryWidget";
import MaintenanceForecastChart from "./MaintenanceForecastChart";
import PartUsageRateChart from "./PartUsageRateChart";
import PartReplacementHistory from "./PartReplacementHistory";
import { Separator } from "@/components/ui/separator";

const MaintenanceSchedule = () => {
  return (
    <div id="tracker" className="space-y-8">
      <DashboardSummary />
      
      <InventoryAlert />

      {/* Widgets Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <UpcomingTasks />
        </div>
        <LowInventoryWidget />
      </div>

      <Separator />

      <h2 className="text-2xl font-bold">Maintenance Log & Schedule</h2>
      <MaintenanceTracker />
      
      <Separator />

      <h2 className="text-2xl font-bold">Reports & Insights</h2>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MaintenanceForecastChart />
        <PartUsageRateChart />
      </div>
      
      <PartReplacementHistory />
    </div>
  );
};

export default MaintenanceSchedule;