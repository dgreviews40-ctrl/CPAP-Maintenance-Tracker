"use client";

import Layout from "@/components/Layout";
import MaintenanceSchedule from "@/components/MaintenanceSchedule";
import MaintenanceLog from "@/components/MaintenanceLog";
import Inventory from "@/components/Inventory";
import DashboardTabs from "@/components/DashboardTabs";
import { TabsContent } from "@/components/ui/tabs";
import { useState } from "react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("schedule");

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="w-full max-w-6xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold">CPAP Maintenance Tracker</h1>
            <p className="text-xl text-muted-foreground">
              Keep track of your machine maintenance and part inventory.
            </p>
          </header>
          
          <DashboardTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="mt-6">
            <TabsContent value="schedule">
              <MaintenanceSchedule />
            </TabsContent>
            <TabsContent value="maintenance">
              <MaintenanceLog />
            </TabsContent>
            <TabsContent value="inventory">
              <Inventory />
            </TabsContent>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;