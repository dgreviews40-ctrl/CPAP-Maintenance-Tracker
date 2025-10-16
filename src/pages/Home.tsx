"use client";

import { Layout } from "@/components/ui/layout";
import { MachineList } from "@/components/MachineList";
import { MaintenanceTracker } from "@/components/MaintenanceTracker";


const Home = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">CPAP Tracker</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <MachineList />
          </div>
          <div className="lg:col-span-1">
            <MaintenanceTracker />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;