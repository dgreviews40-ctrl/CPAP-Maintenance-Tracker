"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";
import { useUserParts, PartData } from "./use-user-parts";
import { parseMaintenanceMachineString } from "@/utils/parts"; // Import utility

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

export function useMaintenanceHistory() {
  const { user, loading: authLoading } = useAuth();
  const { userParts, loading: partsLoading } = useUserParts();
  const [history, setHistory] = useState<PartHistoryMap>({});
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    if (!user || partsLoading) {
      if (!user) setHistory({});
      setLoading(false);
      return;
    }

    setLoading(true);

    // Fetch all maintenance entries for the user
    const { data, error } = await supabase
      .from("maintenance_entries")
      .select("*")
      .order("last_maintenance", { ascending: false }); // Order by last maintenance date descending

    if (error) {
      console.error("Error fetching maintenance history:", error);
      setHistory({});
      setLoading(false);
      return;
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

    setHistory(historyMap);
    setLoading(false);
  }, [user, userParts, partsLoading]);

  useEffect(() => {
    if (!authLoading) {
      fetchHistory();
    }
  }, [authLoading, fetchHistory]);

  return { history, loading };
}