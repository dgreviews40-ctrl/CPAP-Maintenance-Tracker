"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Wrench, Bell, Package } from "lucide-react";

interface DashboardTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3 md:grid-cols-4">
        <TabsTrigger value="schedule" className="flex items-center">
          <Calendar className="h-4 w-4 mr-2 hidden sm:inline" /> Schedule
        </TabsTrigger>
        <TabsTrigger value="maintenance" className="flex items-center">
          <Wrench className="h-4 w-4 mr-2 hidden sm:inline" /> Maintenance Log
        </TabsTrigger>
        <TabsTrigger value="inventory" className="flex items-center">
          <Package className="h-4 w-4 mr-2 hidden sm:inline" /> Inventory
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default DashboardTabs;