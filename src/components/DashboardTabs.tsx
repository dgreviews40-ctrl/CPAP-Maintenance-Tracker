"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MaintenanceTracker from "./MaintenanceTracker";
import FrequencyManagement from "./FrequencyManagement";
import NotificationCenter from "./NotificationCenter";
import DashboardSummary from "./DashboardSummary";
import UpcomingTasks from "./UpcomingTasks";
import LowInventoryWidget from "./LowInventoryWidget";
import MaintenanceForecastChart from "./MaintenanceForecastChart";
import { Separator } from "@/components/ui/separator";
import { Wrench, Bell, List, LayoutDashboard } from "lucide-react";

const DashboardTabs = () => {
  return (
    <Tabs defaultValue="dashboard" className="w-full">
      <TabsList className="grid w-full grid-cols-4 h-12">
        <TabsTrigger value="dashboard" className="flex items-center">
          <LayoutDashboard className="h-4 w-4 mr-2 hidden sm:inline" /> Dashboard
        </TabsTrigger>
        <TabsTrigger value="tracker" className="flex items-center">
          <List className="h-4 w-4 mr-2 hidden sm:inline" /> Tracker
        </TabsTrigger>
        <TabsTrigger value="frequency" className="flex items-center">
          <Wrench className="h-4 w-4 mr-2 hidden sm:inline" /> Frequency
        </TabsTrigger>
        <TabsTrigger value="notifications" className="flex items-center">
          <Bell className="h-4 w-4 mr-2 hidden sm:inline" /> Notifications
        </TabsTrigger>
      </TabsList>

      {/* Dashboard Overview Tab */}
      <TabsContent value="dashboard" className="mt-6">
        <h3 className="text-2xl font-bold mb-4">Overview</h3>
        <DashboardSummary />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <UpcomingTasks />
          <LowInventoryWidget />
          <div className="lg:col-span-2">
            <MaintenanceForecastChart />
          </div>
        </div>
      </TabsContent>

      {/* Maintenance Tracker Tab */}
      <TabsContent value="tracker" className="mt-6">
        <h3 className="text-2xl font-bold mb-4">Maintenance Tracker</h3>
        <Separator className="mb-6" />
        <MaintenanceTracker />
      </TabsContent>

      {/* Frequency Management Tab */}
      <TabsContent value="frequency" className="mt-6">
        <h3 className="text-2xl font-bold mb-4">Custom Frequencies</h3>
        <Separator className="mb-6" />
        <FrequencyManagement />
      </TabsContent>

      {/* Notifications Tab */}
      <TabsContent value="notifications" className="mt-6">
        <h3 className="text-2xl font-bold mb-4">Notification Settings</h3>
        <Separator className="mb-6" />
        <NotificationCenter />
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;