"use client";

import React from 'react';
import { Separator } from "@/components/ui/separator";
import MaintenanceSummary from '@/components/MaintenanceSummary';
import InventorySummary from '@/components/InventorySummary';
import UpcomingMaintenance from '@/components/UpcomingMaintenance';
import PartReplacementHistory from '@/components/PartReplacementHistory';

const Reports = () => {
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Reports & Analytics</h1>
      <p className="text-muted-foreground">
        Overview of maintenance activities, inventory status, and upcoming tasks.
      </p>

      {/* Maintenance Summary */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Maintenance Summary</h2>
        <Separator className="mb-4" />
        <MaintenanceSummary />
      </section>

      {/* Inventory Summary */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Inventory Summary</h2>
        <Separator className="mb-4" />
        <InventorySummary />
      </section>

      {/* Upcoming Maintenance */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Upcoming Maintenance</h2>
        <Separator className="mb-4" />
        <UpcomingMaintenance />
      </section>
    </div>
  );
};

export default Reports;