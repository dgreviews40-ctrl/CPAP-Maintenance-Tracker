"use client";

import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wrench, Package, Home, Settings2 } from "lucide-react";

const DashboardTabs = () => {
  return (
    <TabsList className="grid w-full grid-cols-4 h-auto">
      <TabsTrigger value="overview" className="flex items-center">
        <Home className="h-4 w-4 mr-2 hidden sm:inline" /> Overview
      </TabsTrigger>
      <TabsTrigger value="maintenance" className="flex items-center">
        <Wrench className="h-4 w-4 mr-2 hidden sm:inline" /> Maintenance
      </TabsTrigger>
      <TabsTrigger value="inventory" className="flex items-center">
        <Package className="h-4 w-4 mr-2 hidden sm:inline" /> Inventory
      </TabsTrigger>
      <TabsTrigger value="machines" className="flex items-center">
        <Settings2 className="h-4 w-4 mr-2 hidden sm:inline" /> Machines
      </TabsTrigger>
    </TabsList>
  );
};

export default DashboardTabs;