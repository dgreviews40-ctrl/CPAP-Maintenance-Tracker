"use client";

import MaintenanceTracker from "@/components/MaintenanceTracker";
import FrequencyManagement from "@/components/FrequencyManagement";
import InventoryAlert from "@/components/InventoryAlert";
import DashboardSummary from "@/components/DashboardSummary";
import InventoryStatusChart from "@/components/InventoryStatusChart";
import PartUsageRateChart from "@/components/PartUsageRateChart";
import PartReplacementHistory from "@/components/PartReplacementHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { useDataRefresh } from "@/contexts/DataRefreshContext";

const Index = () => {
  const { dataRefreshKey } = useDataRefresh();

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold">CPAP Maintenance Hub</h1>
          <p className="text-xl text-muted-foreground">
            Keep your CPAP machine running smoothly.
          </p>
        </header>
        <main className="w-full max-w-6xl mx-auto space-y-8">
          <InventoryAlert />
          
          {/* Dashboard Summary */}
          <DashboardSummary key={`summary-${dataRefreshKey}`} />

          {/* Charts and History */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <InventoryStatusChart key={`inventory-chart-${dataRefreshKey}`} />
              <PartUsageRateChart key={`usage-chart-${dataRefreshKey}`} dataRefreshKey={dataRefreshKey} />
            </div>
            <div className="lg:col-span-1">
              <PartReplacementHistory key={`history-${dataRefreshKey}`} dataRefreshKey={dataRefreshKey} />
            </div>
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="tracker">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tracker">Maintenance Tracker</TabsTrigger>
              <TabsTrigger value="frequency">Frequency Customization</TabsTrigger>
              <TabsTrigger value="inventory" asChild>
                <Link to="/inventory">Part Inventory</Link>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="tracker">
              <MaintenanceTracker />
            </TabsContent>
            <TabsContent value="frequency">
              <FrequencyManagement />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </Layout>
  );
};

export default Index;