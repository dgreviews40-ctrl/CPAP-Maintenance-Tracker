"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";
import { useAllMachines } from "./use-all-machines";
import { parseMaintenanceMachineString } from "@/utils/parts";
import { useQuery } from "@tanstack/react-query";

export interface PartData {
  machineLabel: string;
  partTypeLabel: string;
  modelLabel: string;
  reorderInfo: string;
  uniqueKey: string;
  quantity?: number;
  reorderThreshold?: number;
  imageUrl?: string; // Added imageUrl
}

const fetchUserParts = async (userId: string | undefined, allMachines: any[]): Promise<PartData[]> => {
  if (!userId) return [];

  const uniqueKeys = new Set<string>();
  const partsMap = new Map<string, PartData>();
  const inventoryMap = new Map<string, { quantity: number, reorder_threshold: number }>();

  // 1. Fetch from Maintenance Entries
  const { data: maintenanceData, error: maintenanceError } = await supabase
    .from("maintenance_entries")
    .select("machine");

  if (maintenanceError) {
    console.error("Error fetching maintenance parts:", maintenanceError);
  } else if (maintenanceData) {
    maintenanceData.forEach(entry => {
      const { machineLabel, partTypeLabel, modelLabel } = parseMaintenanceMachineString(entry.machine);
      if (machineLabel && partTypeLabel && modelLabel) {
        uniqueKeys.add(`${machineLabel}|${partTypeLabel}|${modelLabel}`);
      }
    });
  }

  // 2. Fetch from Part Inventory
  const { data: inventoryData, error: inventoryError } = await supabase
    .from("part_inventory")
    .select("machine_label, part_type_label, part_model_label, quantity, reorder_threshold");

  if (inventoryError) {
    console.error("Error fetching inventory parts:", inventoryError);
  } else if (inventoryData) {
    inventoryData.forEach(item => {
      const key = `${item.machine_label}|${item.part_type_label}|${item.part_model_label}`;
      uniqueKeys.add(key);
      inventoryMap.set(key, { quantity: item.quantity, reorder_threshold: item.reorder_threshold });
    });
  }

  // 3. Map unique keys using the comprehensive `allMachines` list
  uniqueKeys.forEach(key => {
    const [machineLabel, partTypeLabel, modelLabel] = key.split('|');
    
    const machineData = allMachines.find(m => m.label === machineLabel);
    const partTypeData = machineData?.parts.find(p => p.label === partTypeLabel);
    const modelData = partTypeData?.models.find(m => m.label === modelLabel);
    
    const inventoryStatus = inventoryMap.get(key);

    if (modelData) {
      partsMap.set(key, {
        machineLabel,
        partTypeLabel,
        modelLabel,
        reorderInfo: modelData.reorder_info,
        uniqueKey: key,
        imageUrl: partTypeData?.image_url, // Retrieve image URL from partTypeData
        ...(inventoryStatus && { 
          quantity: inventoryStatus.quantity, 
          reorderThreshold: inventoryStatus.reorder_threshold 
        }),
      });
    }
  });

  return Array.from(partsMap.values());
};

export function useUserParts() {
  const { user, loading: authLoading } = useAuth();
  const { allMachines, loading: machinesLoading } = useAllMachines();

  const { data: userParts = [], isLoading, refetch } = useQuery<PartData[]>({
    queryKey: ['userParts', user?.id, allMachines],
    queryFn: () => fetchUserParts(user?.id, allMachines),
    enabled: !authLoading && !machinesLoading,
    staleTime: 1000 * 60 * 1, // 1 minute
  });

  return { userParts, loading: isLoading, refetchUserParts: refetch };
}