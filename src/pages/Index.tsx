"use client";

import MaintenanceTracker from "@/components/MaintenanceTracker";
import FrequencyManagement from "@/components/FrequencyManagement";
import InventoryAlert from "@/components/InventoryAlert";
import DashboardSummary from "@/components/DashboardSummary";
import InventoryStatusChart from "@/components/InventoryStatusChart";
import PartReplacementHistory from "@/components/PartReplacementHistory";
import NotificationCenter from "@/components/NotificationCenter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import MaintenanceForecastChart from "@/components/MaintenanceForecastChart";
import { BarChart, Home, Sliders, Wrench } from "lucide-react";

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
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dashboard">
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="tracker">
                <Wrench className="h-4 w-4 mr-2" />
                Maintenance Tracker
              </TabsTrigger>
              <TabsTrigger value="reports">
                <BarChart className="h-4 w-4 mr-2" />
                Reports & Settings
              </TabsTrigger>
              <TabsTrigger value="inventory" asChild>
                <Link to="/inventory">
                  <Sliders className="h-4 w-4 mr-2" />
                  Part Inventory
                </Link>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="mt-6">
              <div className="space-y-6">
                <DashboardSummary />
                <InventoryAlert />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <MaintenanceForecastChart />
                  <InventoryStatusChart />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tracker" className="mt-6">
              <MaintenanceTracker />
            </TabsContent>

            <TabsContent value="reports" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="space-y-6">
                  <FrequencyManagement />
                  <NotificationCenter />
                </div>
                <div>
                  <PartReplacementHistory />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </Layout>
  );
};

export default Index;