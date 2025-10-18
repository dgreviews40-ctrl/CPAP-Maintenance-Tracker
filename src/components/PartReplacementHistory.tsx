"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Calendar } from "lucide-react";
import { useUserParts } from "@/hooks/use-user-parts";
import { format, parseISO } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { parseMaintenanceMachineString } from "@/utils/parts";

interface PartHistory {
  uniqueKey: string;
  machineLabel: string;
  partTypeLabel: string;
  modelLabel: string;
  history: Date[];
}

const PartReplacementHistory = ({ dataRefreshKey }: { dataRefreshKey: number }) => {
  const { userParts, loading: loadingUserParts } = useUserParts();
  const [historyData, setHistoryData] = useState<PartHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (userParts.length === 0) {
        setHistoryData([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      
      const { data, error } = await supabase
        .from("maintenance_entries")
        .select("machine, last_maintenance")
        .order("last_maintenance", { ascending: false });

      if (error) {
        console.error("Error fetching maintenance history:", error);
        setLoading(false);
        return;
      }

      const historyMap = new Map<string, Date[]>();

      data.forEach((entry) => {
        const { machineLabel, partTypeLabel, modelLabel } = parseMaintenanceMachineString(entry.machine);
        if (!machineLabel || !partTypeLabel || !modelLabel) return;

        const key = `${machineLabel}|${partTypeLabel}|${modelLabel}`;
        const dateString = entry.last_maintenance?.replace(/-/g, "/");
        if (!dateString) return;

        const date = parseISO(dateString);
        if (isNaN(date.getTime())) {
          console.warn("Skipping invalid date entry:", entry);
          return;
        }

        if (!historyMap.has(key)) {
          historyMap.set(key, []);
        }
        historyMap.get(key)?.push(date);
      });

      const processedHistory: PartHistory[] = userParts.map((part) => {
        const dates = historyMap.get(part.uniqueKey) || [];
        // Sort dates newest to oldest and take the last 5
        dates.sort((a, b) => b.getTime() - a.getTime());
        return {
          ...part,
          history: dates.slice(0, 5),
        };
      }).filter((p) => p.history.length > 0);

      setHistoryData(processedHistory);
      setLoading(false);
    };

    fetchHistory();
  }, [userParts, dataRefreshKey]);

  // ... rest of the component