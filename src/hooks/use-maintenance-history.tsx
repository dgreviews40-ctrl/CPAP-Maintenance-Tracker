"use client";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
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

const fetchMaintenanceHistory = async (userId: string | undefined): Promise<PartHistoryMap> => {
  if (!userId) return {};

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

  (data as MaintenanceEntry[]).forEach((entry) => {
    const { machineLabel, partTypeLabel, modelLabel } = parseMaintenanceMachineString(entry.machine);
    const uniqueKey = `${machineLabel}|${partTypeLabel}|${modelLabel}`;

    // Group entries by unique key derived from the machine string
    if (uniqueKey) {
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

  const { data: history = {}, isLoading, refetch } = useQuery<PartHistoryMap>({
    queryKey: queryKeys.maintenance.history(user?.id || 'anonymous'),
    queryFn: () => fetchMaintenanceHistory(user?.id),
    enabled: !authLoading && !!user, // Only wait for user authentication
    staleTime: 1000 * 10, // 10 seconds
  });

  return { history, loading: isLoading, refetchHistory: refetch };
}