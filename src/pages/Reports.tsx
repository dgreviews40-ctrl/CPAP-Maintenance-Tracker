"use client";

import Layout from "@/components/Layout";
import PartReplacementHistory from "@/components/PartReplacementHistory";
import DataManagement from "@/components/DataManagement";
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
              <h1 className="text-4xl font-bold">Advanced Settings</h1>
              {/* Removed subtitle paragraph */}
            </header>
            <div className="w-[150px]">
              {/* Spacer to balance the header */}
            </div>
          </div>
          <main className="space-y-8">
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Replacement History</h2>
              <Separator className="mb-4" />
              <PartReplacementHistory />
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