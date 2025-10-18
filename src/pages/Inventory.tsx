"use client";

import PartInventory from "@/components/PartInventory";
import Layout from "@/components/Layout";

const Inventory = () => {
  return (
    <Layout>
      <div className="container mx-auto p-4">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold">Part Inventory Management</h1>
          <p className="text-xl text-muted-foreground">
            Track your spare parts and reorder thresholds.
          </p>
        </header>
        <main className="w-full max-w-4xl mx-auto">
          <PartInventory />
        </main>
      </div>
    </Layout>
  );
};

export default Inventory;