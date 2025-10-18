"use client";

import Layout from "@/components/Layout";
import DashboardTabs from "@/components/DashboardTabs"; // Import the new component
import { Separator } from "@/components/ui/separator";

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
          <DashboardTabs />
        </main>
      </div>
    </Layout>
  );
};

export default Index;