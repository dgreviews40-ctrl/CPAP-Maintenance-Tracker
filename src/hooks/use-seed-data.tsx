"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";
import { showLoading, dismissToast, showSuccess, showError } from "@/utils/toast";
import { subDays, addDays, format } from "date-fns";

// A flag to prevent re-running in the same session
let hasSeeded = false;

export function useSeedData(onSeedComplete: () => void) {
  const { user } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!user || hasSeeded) {
      setIsChecking(false);
      return;
    }

    const checkForDataAndSeed = async () => {
      // Check if any data exists for this user
      const { count: maintenanceCount, error: maintenanceError } = await supabase
        .from("maintenance_entries")
        .select('*', { count: 'exact', head: true });

      const { count: inventoryCount, error: inventoryError } = await supabase
        .from("part_inventory")
        .select('*', { count: 'exact', head: true });

      if (maintenanceError || inventoryError) {
        console.error("Error checking for existing data:", maintenanceError || inventoryError);
        setIsChecking(false);
        return;
      }

      // If data already exists, do nothing.
      if ((maintenanceCount ?? 0) > 0 || (inventoryCount ?? 0) > 0) {
        hasSeeded = true; // Mark as "seeded" even if we did nothing, to prevent re-checks
        setIsChecking(false);
        return;
      }

      // If we reach here, tables are empty. Let's seed.
      const toastId = showLoading("Setting up your account with some sample data...");
      
      try {
        const today = new Date();
        const seedMaintenanceData = [
          {
            user_id: user.id,
            machine: "ResMed AirSense 11 - Filter - Standard Filter (30-day) (SKU: ResMed SKU 37301)",
            last_maintenance: format(subDays(today, 45), 'yyyy-MM-dd'),
            next_maintenance: format(subDays(today, 15), 'yyyy-MM-dd'), // Overdue
            notes: "Sample overdue entry."
          },
          {
            user_id: user.id,
            machine: "Philips Respironics DreamStation 2 - Tubing - Heated Tubing (SKU: Philips SKU 1122184)",
            last_maintenance: format(subDays(today, 85), 'yyyy-MM-dd'),
            next_maintenance: format(addDays(today, 5), 'yyyy-MM-dd'), // Due soon
            notes: "Sample entry that is due soon."
          },
          {
            user_id: user.id,
            machine: "ResMed AirSense 11 - Water Chamber - Standard Water Chamber (SKU: ResMed SKU 37300)",
            last_maintenance: format(subDays(today, 30), 'yyyy-MM-dd'),
            next_maintenance: format(addDays(today, 150), 'yyyy-MM-dd'), // On schedule
            notes: "Sample on-schedule entry."
          }
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
          {
            user_id: user.id,
            machine_label: "Philips Respironics DreamStation 2",
            part_type_label: "Tubing",
            part_model_label: "Heated Tubing",
            reorder_info: "Philips SKU 1122184",
            quantity: 1,
            reorder_threshold: 1, // Needs reorder
            last_restock: format(subDays(today, 60), 'yyyy-MM-dd')
          }
        ];

        const { error: maintenanceInsertError } = await supabase.from("maintenance_entries").insert(seedMaintenanceData);
        if (maintenanceInsertError) throw maintenanceInsertError;

        const { error: inventoryInsertError } = await supabase.from("part_inventory").insert(seedInventoryData);
        if (inventoryInsertError) throw inventoryInsertError;

        hasSeeded = true;
        dismissToast(toastId);
        showSuccess("Sample data added! Your dashboard is now live.");
        onSeedComplete(); // Callback to trigger a re-fetch in the parent component

      } catch (error) {
        console.error("Failed to seed data:", error);
        dismissToast(toastId);
        showError("Could not add sample data.");
      } finally {
        setIsChecking(false);
      }
    };

    checkForDataAndSeed();

  }, [user, onSeedComplete]);

  return { isChecking };
}