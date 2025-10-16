"use client";

import { Layout } from "@/components/ui/layout";
import MachineList from "@/components/MachineList";
import MaintenanceTracker from "@/components/MaintenanceTracker";
import Reminders from "@/components/Reminders";
import { MadeWithDyad } from "@/components/made-with-dyad";

const Index = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">CPAP Tracker</h1>
        
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Popular Machines</h2>
            <MachineList />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <MaintenanceTracker />
            <Reminders />
          </div>
        </div>
      </div>
      <MadeWithDyad />
    </Layout>
  );
};

export default Index;