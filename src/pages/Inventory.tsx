"use client";

import PartInventory from "@/components/PartInventory";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Inventory = () => {
  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="w-full max-w-4xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
              </Button>
            </Link>
            <header className="text-center flex-grow">
              <h1 className="text-4xl font-bold">Part Inventory Management</h1>
              <p className="text-xl text-muted-foreground">
                Track your spare parts and reorder thresholds.
              </p>
            </header>
            <div className="w-[150px]">
              {/* Spacer to balance the header */}
            </div>
          </div>
          <main>
            <PartInventory />
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default Inventory;