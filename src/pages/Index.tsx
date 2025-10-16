"use client";

import { Layout } from "@/components/ui/layout";
import MachineList from "@/components/MachineList";
import MaintenanceTracker from "@/components/MaintenanceTracker";
import Reminders from "@/components/Reminders";
import { MadeWithDyad } from "@/components/made-with-dyad";

const popularMachines = [
  {
    id: 1,
    name: "Philips Respironics DreamStation",
    description: "A popular and reliable CPAP machine known for its sleek, user-friendly design.",
    image: "https://www.cpapstore.eu/wp-content/uploads/2020/05/DreamStation-Auto-CPAP-with-Humidifier-and-Heated-Tube-2.jpg"
  },
  {
    id: 2,
    name: "ResMed AirSense 10",
    description: "Features a built-in humidifier and advanced event detection for a comfortable experience.",
    image: "https://www.resmed.de/wp-content/uploads/2021/03/airsense-10-autoset-silo-820x680-1.jpg"
  },
  {
    id: 3,
    name: "ResMed S9",
    description: "A versatile machine with advanced data tracking and Climate Control technology.",
    image: "https://www.cpap.com/images/product/11463/resmed-s9-autoset-cpap-machine-heated-humidifier-and-climate-line-heated-tube.jpg"
  }
];

const Index = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">CPAP Tracker</h1>
        
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Popular Machines</h2>
            <MachineList machines={popularMachines} />
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