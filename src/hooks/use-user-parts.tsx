"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./use-auth";
import { cpapMachines } from "@/data/cpap-machines";

interface UniquePartKey {
  machineLabel: string;
  partTypeLabel: string;
  modelLabel: string;
}

interface PartData {
  machineLabel: string;
  partTypeLabel: string;
  modelLabel: string;
  reorderInfo: string;
  uniqueKey: string;
}

// Helper to parse the machine string from maintenance_entries
const parseMaintenanceMachineString = (machineString: string): UniquePartKey => {
  // Expected format: "Machine Label - Part Type Label - Part Model Label (SKU: XXX)"
  const parts = machineString.split(' - ');
  
  const machine = parts[0]?.trim() || machineString;
  const partType = parts[1]?.trim() || "";
  
  // Remove SKU info from part model
  const partModelWithSku = parts[2]?.trim() || "";
  const partModel = partModelWithSku.replace(/\s*\(SKU:.*\)/, '').trim();

  return { machineLabel: machine, partTypeLabel: partType, modelLabel: partModel };
};


export function useUserParts() {
  const { user, loading: authLoading } = useAuth();
  const [userParts, setUserParts] = useState<PartData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserParts = useCallback(async () => {
    if (!user) {
      setUserParts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    const uniqueKeys = new Set<string>();
    const partsMap = new Map<string, PartData>();

    // 1. Fetch unique parts from Maintenance Entries
    const { data: maintenanceData, error: maintenanceError } = await supabase
      .from("maintenance_entries")
      .select("machine");

    if (maintenanceError) {
      console.error("Error fetching maintenance parts:", maintenanceError);
    } else if (maintenanceData) {
      maintenanceData.forEach(entry => {
        const { machineLabel, partTypeLabel, modelLabel } = parseMaintenanceMachineString(entry.machine);
        if (machineLabel && partTypeLabel && modelLabel) {
          const key = `${machineLabel}|${partTypeLabel}|${modelLabel}`;
          uniqueKeys.add(key);
        }
      });
    }

    // 2. Fetch unique parts from Part Inventory
    const { data: inventoryData, error: inventoryError } = await supabase
      .from("part_inventory")
      .select("machine_label, part_type_label, part_model_label, reorder_info");

    if (inventoryError) {
      console.error("Error fetching inventory parts:", inventoryError);
    } else if (inventoryData) {
      inventoryData.forEach(item => {
        const key = `${item.machine_label}|${item.part_type_label}|${item.part_model_label}`;
        uniqueKeys.add(key);
      });
    }

    // 3. Map unique keys back to full data structure using cpapMachines data
    uniqueKeys.forEach(key => {
      const [machineLabel, partTypeLabel, modelLabel] = key.split('|');
      
      const machineData = cpapMachines.find(m => m.label === machineLabel);
      const partTypeData = machineData?.parts.find(p => p.label === partTypeLabel);
      const modelData = partTypeData?.models.find(m => m.label === modelLabel);

      if (modelData) {
        partsMap.set(key, {
          machineLabel,
          partTypeLabel,
          modelLabel,
          reorderInfo: modelData.reorder_info,
          uniqueKey: key,
        });
      }
    });

    setUserParts(Array.from(partsMap.values()));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      fetchUserParts();
    }
  }, [authLoading, fetchUserParts]);

  return { userParts, loading };
}