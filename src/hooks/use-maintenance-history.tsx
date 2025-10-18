"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useUserParts, PartData } from "./use-user-parts";
import { parseMaintenanceMachineString } from "@/utils/parts";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";

export type MaintenanceEntry = {
  id: string;
  machine: string;
  last_maintenance: string;
  next_maintenance: string;
  notes?: string;
  created_at: string;
};

export type PartHistoryMap = {
  [uniqueKey: string]: MaintenanceEntry[];
};

const fetchMaintenanceHistory = async (userId: string | undefined, userParts: PartData[]): Promise<PartHistoryMap> => {
  if (!userId || userParts.length === 0) return {};

  // Fetch all maintenance entries for the user
  const { data, error } = await supabase
    .from("maintenance_entries")
    .select("*")
    .order("last_maintenance", { ascending: false }); // Order by last maintenance date descending

  if (error) {
    console.error("Error fetching maintenance history:", error);
    throw new Error("Failed to fetch maintenance history.");
  }

  const historyMap: PartHistoryMap = {};

  // Create a set of valid unique keys from userParts for efficient lookup
  const validUniqueKeys = new Set(userParts.map(p => p.uniqueKey));

  (data as MaintenanceEntry[]).forEach((entry) => {
    const { machineLabel, partTypeLabel, modelLabel } = parseMaintenanceMachineString(entry.machine);
    const uniqueKey = `${machineLabel}|${partTypeLabel}|${modelLabel}`;

    // Only process entries that correspond to a known unique part key
    if (validUniqueKeys.has(uniqueKey)) {
      if (!historyMap[uniqueKey]) {
        historyMap[uniqueKey] = [];
      }
      historyMap[uniqueKey].push(entry);
    }
  });

  return historyMap;
};

export function useMaintenanceHistory() {
  const { user, isLoading: authLoading } = useAuth();
  const { userParts, loading: partsLoading } = useUserParts();

  const { data: history = {}, isLoading, refetch } = useQuery<PartHistoryMap>({
    queryKey: queryKeys.maintenance.history(user?.id || 'anonymous'),
    queryFn: () => fetchMaintenanceHistory(user?.id, userParts),
    enabled: !authLoading && !partsLoading,
    staleTime: 1000 * 10, // 10 seconds
  });

  return { history, loading: isLoading, refetchHistory: refetch };
}