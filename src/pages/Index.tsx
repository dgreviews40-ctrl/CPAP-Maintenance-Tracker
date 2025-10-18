"use client";

import MaintenanceTracker from "@/components/MaintenanceTracker";
import FrequencyManagement from "@/components/FrequencyManagement";
import InventoryAlert from "@/components/InventoryAlert";
import DashboardSummary from "@/components/DashboardSummary";
import InventoryStatusChart from "@/components/InventoryStatusChart";
import PartUsageRateChart from "@/components/PartUsageRateChart";
import PartReplacementHistory from "@/components/PartReplacementHistory";
import NotificationCenter from "@/components/NotificationCenter"; // New import
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";

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
        <main className="w-full max-w-6xl mx-auto space-y-8">
          
          {/* Top Alerts */}
          <InventoryAlert />
          
          {/* Dashboard Summary */}
          <DashboardSummary />

          {/* Main Content Area: Charts (Left) and Timeline/Notifications (Right Sidebar) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Charts (2/3 width on large screens) */}
            <div className="lg:col-span-2 space-y-6">
              <InventoryStatusChart />
              <PartUsageRateChart />
            </div>
            
            {/* Right Column: Notifications & History (1/3 width on large screens) */}
            <div className="lg:col-span-1 space-y-6">
              <NotificationCenter />
              <PartReplacementHistory />
            </div>
          </div>

          {/* Main Tabs (Maintenance Tracker & Frequency) */}
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