"use client";

import MaintenanceTracker from "@/components/MaintenanceTracker";
import FrequencyManagement from "@/components/FrequencyManagement";
import InventoryAlert from "@/components/InventoryAlert"; // Import the new alert component
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
        <main className="w-full max-w-4xl mx-auto">
          <InventoryAlert /> {/* Display global alert here */}
          <Tabs defaultValue="tracker">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tracker">Maintenance Tracker</TabsTrigger>
              <TabsTrigger value="frequency">Frequency Customization</TabsTrigger>
              {/* Update Inventory tab to be a link */}
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
            {/* Removed TabsContent for inventory */}
          </Tabs>
        </main>
      </div>
    </Layout>
  );
};

export default Index;