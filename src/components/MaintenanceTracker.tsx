"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/hooks/use-user";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format, subDays, addDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const MaintenanceTracker = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  const [dataRefreshKey, setDataRefreshKey] = useState(0);

  const handleSeedData = async () => {
    if (!user) return;
    setIsSeeding(true);
    const toastId = toast.showLoading("Setting up sample data...");

    try {
      // 1. Clear existing data for a clean slate
      await supabase.from("maintenance_entries").delete().eq("user_id", user.id);
      await supabase.from("part_inventory").delete().eq("user_id", user.id);

      // 2. Define seed data
      const today = new Date();
      
      const seedMaintenanceData = [
        {
          user_id: user.id,
          machine: "ResMed AirSense 11 - Filter - Standard Filter (30-day) (SKU: ResMed SKU 37301)",
          last_maintenance: format(subDays(today, 90), 'yyyy-MM-dd'),
          next_maintenance: format(subDays(today, 60), 'yyyy-MM-dd'),
          notes: "Sample historical entry for usage rate calculation."
        },
        // ... other seed data
      ];

      const seedInventoryData = [
        {
          user_id: user.id,
          machine_label: "ResMed AirSense 11",
          part_type_label: "Filter",
          part_model_label: "Standard Filter (30-day)",
          reorder_info: "ResMed SKU 37301",
          quantity: 5,
          reorder_threshold: 2,
          last_restock: format(today, 'yyyy-MM-dd')
        },
        // ... other seed data
      ];

      // 3. Insert new data
      const { error: maintenanceInsertError } = await supabase.from("maintenance_entries").insert(seedMaintenanceData);
      if (maintenanceInsertError) throw maintenanceInsertError;

      const { error: inventoryInsertError } = await supabase.from("part_inventory").insert(seedInventoryData);
      if (inventoryInsertError) throw inventoryInsertError;

      console.log("Successfully seeded data");
      toast.dismiss(toastId);
      toast.success("Sample data added successfully!");
      
      // 4. Refresh the UI by incrementing dataRefreshKey
      setDataRefreshKey(prev => prev + 1);
      
    } catch (error) {
      console.error("Failed to seed data:", error);
      toast.dismiss(toastId);
      toast.error("Could not add sample data. Please try again.");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Maintenance Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={handleSeedData} disabled={isSeeding}>
          {isSeeding ? "Seeding..." : "Load Sample Data"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MaintenanceTracker;