"use client";

import Layout from "@/components/Layout";
import DataManagement from "@/components/DataManagement";
import NotificationCenter from "@/components/NotificationCenter";
import FrequencySettings from "@/components/FrequencySettings";
import PartUsageRateChart from "@/components/PartUsageRateChart"; // Import the usage chart
import PartReplacementHistory from "@/components/PartReplacementHistory"; // Import the history component
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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
              <h1 className="text-4xl font-bold">Advanced Settings & Reports</h1>
            </header>
            <div className="w-[150px]">
              {/* Spacer to balance the header */}
            </div>
          </div>
          <main className="space-y-8">
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Usage & Compliance Reports</h2>
              <Separator className="mb-4" />
              <PartUsageRateChart />
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Recent Replacement History</h2>
              <Separator className="mb-4" />
              <PartReplacementHistory />
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Maintenance Frequencies</h2>
              <Separator className="mb-4" />
              <FrequencySettings />
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Notifications</h2>
              <Separator className="mb-4" />
              <NotificationCenter />
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Data Management</h2>
              <Separator className="mb-4" />
              <DataManagement />
            </section>
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;