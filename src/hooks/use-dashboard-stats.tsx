"use client";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { isBefore, isWithinInterval, addDays, startOfDay, format, differenceInDays } from "date-fns";
import { parseMaintenanceMachineString, generateUniqueKey } from "@/utils/parts";

interface MaintenanceEntry {
  id: string;
  machine: string;
  next_maintenance: string;
}

interface Stats {
  overdue: number;
  dueSoon: number;
  total: number;
  nextDue: {
    machine: string;
    date: string;
    daysAway: number;
    uniqueKey: string;
  } | null;
}

const fetchDashboardStats = async (userId: string | undefined): Promise<Stats> => {
  if (!userId) {
    return { overdue: 0, dueSoon: 0, total: 0, nextDue: null };
  }
  
  // Fetch all maintenance entries for calculation
  const { data, error } = await supabase
    .from("maintenance_entries")
    .select("id, machine, next_maintenance")
    .order("next_maintenance", { ascending: true });

  if (error) {
    console.error("Error fetching maintenance entries for stats:", error);
    throw new Error("Failed to fetch dashboard statistics.");
  }

  const today = startOfDay(new Date());
  const sevenDaysFromNow = addDays(today, 7);

  let overdueCount = 0;
  let dueSoonCount = 0;
  let nextDueItem: Stats['nextDue'] = null;

  (data as MaintenanceEntry[]).forEach((entry) => {
    if (!entry.next_maintenance) return;

    // Handle timezone issues by replacing hyphens with slashes
    const nextMaintenanceDate = startOfDay(
      new Date(entry.next_maintenance.replace(/-/g, "/")),
    );
    
    if (isNaN(nextMaintenanceDate.getTime())) return;

    if (isBefore(nextMaintenanceDate, today)) {
      overdueCount++;
    } else if (
      isWithinInterval(nextMaintenanceDate, {
        start: today,
        end: sevenDaysFromNow,
      })
    ) {
      dueSoonCount++;
    }
    
    // Find the very next item that is not overdue
    if (!nextDueItem && !isBefore(nextMaintenanceDate, today)) {
      const daysAway = differenceInDays(nextMaintenanceDate, today);
      const { machineLabel, partTypeLabel, modelLabel } = parseMaintenanceMachineString(entry.machine);
      
      nextDueItem = {
        machine: entry.machine,
        date: format(nextMaintenanceDate, 'MMM dd, yyyy'),
        daysAway: daysAway,
        uniqueKey: generateUniqueKey(machineLabel, partTypeLabel, modelLabel),
      };
    }
  });

  return {
    overdue: overdueCount,
    dueSoon: dueSoonCount,
    total: data.length,
    nextDue: nextDueItem,
  };
};

export function useDashboardStats() {
  const { user, isLoading: authLoading } = useAuth();

  const { data, isLoading, error, refetch } = useQuery<Stats>({
    queryKey: queryKeys.maintenance.schedule(user?.id || 'anonymous'),
    queryFn: () => fetchDashboardStats(user?.id),
    enabled: !authLoading && !!user, // Ensure user is present before fetching stats
    staleTime: 1000 * 10, // 10 seconds
  });

  return { stats: data, loading: isLoading, error, refetchStats: refetch };
}