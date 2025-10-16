"use client";

import Layout from "@/components/Layout";
import MachineList from "@/components/MachineList";
import MaintenanceTracker from "@/components/MaintenanceTracker";
import { MadeWithDyad } from "@/components/made-with-dyad";
import DashboardSummary from "@/components/DashboardSummary";

const popularMachines = [
  {
    id: 1,
    name: "Philips Respironics DreamStation",
    description: "A popular and reliable CPAP machine known for its sleek, user-friendly design.",
    image: "https://placehold.co/400x300/e2e8f0/64748b?text=DreamStation"
  },
  {
    id: 2,
    name: "ResMed AirSense 10",
    description: "Features a built-in humidifier and advanced event detection for a comfortable experience.",
    image: "https://placehold.co/400x300/e2e8f0/64748b?text=AirSense+10"
  },
  {
    id: 3,
    name: "ResMed S9",
    description: "A versatile machine with advanced data tracking and Climate Control technology.",
    image: "https://placehold.co/400x300/e2e8f0/64748b?text=ResMed+S9"
  }
];

const Index = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Dashboard Overview</h2>
            <DashboardSummary />
          </div>
          <div>
            <MaintenanceTracker />
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">Popular Machines</h2>
            <MachineList machines={popularMachines} />
          </div>
        </div>
      </div>
      <MadeWithDyad />
    </Layout>
  );
};

export default Index;