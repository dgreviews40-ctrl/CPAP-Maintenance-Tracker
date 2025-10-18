"use client";

import Layout from "@/components/Layout";
import FrequencyManagement from "@/components/FrequencyManagement";
import PartReplacementHistory from "@/components/PartReplacementHistory";
import NotificationCenter from "@/components/NotificationCenter";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import PartUsageRateChart from "@/components/PartUsageRateChart";
import InventoryStatusChart from "@/components/InventoryStatusChart";

const Reports = () => {
  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="w-full max-w-6xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
              </Button>
            </Link>
            <header className="text-center flex-grow">
              <h1 className="text-4xl font-bold">Reports & Advanced Settings</h1>
              <p className="text-xl text-muted-foreground">
                Analyze usage, manage frequencies, and configure notifications.
              </p>
            </header>
            <div className="w-[150px]">
              {/* Spacer to balance the header */}
            </div>
          </div>
          <main className="space-y-8">
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Usage Analysis</h2>
              <Separator className="mb-4" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PartUsageRateChart />
                <InventoryStatusChart />
              </div>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Replacement History</h2>
              <Separator className="mb-4" />
              <PartReplacementHistory />
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Advanced Configuration</h2>
              <Separator className="mb-4" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <FrequencyManagement />
                <NotificationCenter />
              </div>
            </section>
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;