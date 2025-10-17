"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./use-auth";

export interface PartData {
  uniqueKey: string;
  machineLabel: string;
  partTypeLabel: string;
  modelLabel: string;
  reorderInfo?: string;
  quantity: number;
  reorderThreshold: number;
  lastRestock?: string;
}

export const useUserParts = () => {
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
    
    // Fetch inventory data
    const { data: inventory, error: inventoryError } = await supabase
      .from("part_inventory")
      .select("*")
      .order("machine_label", { ascending: true });

    if (inventoryError) {
      console.error("Error fetching inventory:", inventoryError);
      setLoading(false);
      return;
    }

    const partsMap = new Map<string, PartData>();

    inventory.forEach(item => {
      // Create a unique key based on machine, type, and model
      const uniqueKey = `${item.machine_label}|${item.part_type_label}|${item.part_model_label}`;
      
      // Process data into the desired structure
      const part: PartData = {
        uniqueKey: uniqueKey,
        machineLabel: item.machine_label,
        partTypeLabel: item.part_type_label,
        modelLabel: item.part_model_label,
        reorderInfo: item.reorder_info,
        quantity: item.quantity,
        reorderThreshold: item.reorder_threshold,
        lastRestock: item.last_restock,
      };
      
      // Assuming unique keys are unique, otherwise aggregation logic would be needed here.
      partsMap.set(uniqueKey, part);
    });

    setUserParts(Array.from(partsMap.values()));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user && !authLoading) {
      fetchUserParts();
    } else if (!user && !authLoading) {
      setUserParts([]);
      setLoading(false);
    }
  }, [user, authLoading, fetchUserParts]);

  return { userParts, loading };
};