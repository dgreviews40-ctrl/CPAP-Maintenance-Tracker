"use client";

import MaintenanceTracker from "@/components/MaintenanceTracker";
import PartManagement from "@/components/PartManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/Layout";

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
          <Tabs defaultValue="tracker">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tracker">Maintenance Tracker</TabsTrigger>
              <TabsTrigger value="parts">Part Management</TabsTrigger>
            </TabsList>
            <TabsContent value="tracker">
              <MaintenanceTracker />
            </TabsContent>
            <TabsContent value="parts">
              <PartManagement />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </Layout>
  );
};

export default Index;