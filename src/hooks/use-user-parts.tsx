"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useAllMachines } from "./use-all-machines";
import { parseMaintenanceMachineString } from "@/utils/parts";
import { useQuery } from "@tanstack/react-query";
import { useCustomPartImages } from "./use-custom-part-images";
import { queryKeys } from "@/lib/queryKeys";
import { formatErrorMessage } from "@/lib/error-handling";
import { useToast } from "./use-toast";

export interface PartData {
  machineLabel: string;
  partTypeLabel: string;
  modelLabel: string;
  reorderInfo: string;
  uniqueKey: string;
  quantity?: number;
  reorderThreshold?: number;
  imageUrl?: string; // Added imageUrl
  lastRestock?: string | null; // Added lastRestock
}

const fetchUserParts = async (userId: string | undefined, allMachines: any[], customImages: Record<string, string>): Promise<PartData[]> => {
  if (!userId) return [];

  const uniqueKeys = new Set<string>();
  const partsMap = new Map<string, PartData>();
  const inventoryMap = new Map<string, { quantity: number, reorder_threshold: number, last_restock: string | null }>();

  try {
    // 1. Fetch from Maintenance Entries
    const { data: maintenanceData, error: maintenanceError } = await supabase
      .from("maintenance_entries")
      .select("machine");

    if (maintenanceError) {
      console.error("Error fetching maintenance parts:", maintenanceError);
      throw new Error(`Failed to fetch maintenance data: ${maintenanceError.message}`);
    }

    if (maintenanceData) {
      maintenanceData.forEach(entry => {
        try {
          const { machineLabel, partTypeLabel, modelLabel } = parseMaintenanceMachineString(entry.machine);
          if (machineLabel && partTypeLabel && modelLabel) {
            uniqueKeys.add(`${machineLabel}|${partTypeLabel}|${modelLabel}`);
          }
        } catch (err) {
          console.warn('Failed to parse maintenance entry:', entry, err);
        }
      });
    }

    // 2. Fetch from Part Inventory
    const { data: inventoryData, error: inventoryError } = await supabase
      .from("part_inventory")
      .select("machine_label, part_type_label, part_model_label, quantity, reorder_threshold, last_restock");

    if (inventoryError) {
      console.error("Error fetching inventory parts:", inventoryError);
      throw new Error(`Failed to fetch inventory data: ${inventoryError.message}`);
    }

    if (inventoryData) {
      inventoryData.forEach(item => {
        try {
          const key = `${item.machine_label}|${item.part_type_label}|${item.part_model_label}`;
          uniqueKeys.add(key);
          inventoryMap.set(key, { 
            quantity: item.quantity, 
            reorder_threshold: item.reorder_threshold,
            last_restock: item.last_restock,
          });
        } catch (err) {
          console.warn('Failed to parse inventory item:', item, err);
        }
      });
    }

    // 3. Map unique keys using the comprehensive `allMachines` list
    uniqueKeys.forEach(key => {
      try {
        const [machineLabel, partTypeLabel, modelLabel] = key.split('|');
        
        const machineData = allMachines.find(m => m.label === machineLabel);
        const partTypeData = machineData?.parts.find(p => p.label === partTypeLabel);
        const modelData = partTypeData?.models.find(m => m.label === modelLabel);
        
        const inventoryStatus = inventoryMap.get(key);
        const customImageUrl = customImages[key];

        if (modelData) {
          partsMap.set(key, {
            machineLabel,
            partTypeLabel,
            modelLabel,
            reorderInfo: modelData.reorder_info,
            uniqueKey: key,
            imageUrl: customImageUrl || partTypeData?.image_url, 
            ...(inventoryStatus && { 
              quantity: inventoryStatus.quantity, 
              reorderThreshold: inventoryStatus.reorder_threshold,
              lastRestock: inventoryStatus.last_restock,
            }),
          });
        }
      } catch (err) {
        console.warn('Failed to map part key:', key, err);
      }
    });

    return Array.from(partsMap.values());
  } catch (error) {
    console.error('Critical error fetching user parts:', error);
    throw error;
  }
};

export function useUserParts() {
  const { user, isLoading: authLoading } = useAuth();
  const { allMachines, loading: machinesLoading } = useAllMachines();
  const { customImages, loading: imagesLoading } = useCustomPartImages();
  const { toast } = useToast();
  const [lastError, setLastError] = useState<string | null>(null);

  const { data: userParts = [], isLoading, refetch, error } = useQuery<PartData[]>({
    queryKey: queryKeys.parts.userParts(user?.id || 'anonymous'),
    queryFn: () => fetchUserParts(user?.id, allMachines, customImages),
    enabled: !authLoading && !machinesLoading && !imagesLoading,
    staleTime: 1000 * 60 * 1, // 1 minute
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Handle query errors
  useEffect(() => {
    if (error) {
      const errorMsg = formatErrorMessage(error);
      setLastError(errorMsg);
      console.error('Query error in useUserParts:', error);
      toast({
        title: 'Failed to load parts',
        description: errorMsg,
        variant: 'destructive',
      });
    } else {
      setLastError(null);
    }
  }, [error, toast]);

  return { 
    userParts, 
    loading: isLoading, 
    refetchUserParts: refetch,
    error: lastError,
  };
}