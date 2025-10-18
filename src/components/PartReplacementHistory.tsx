"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Calendar } from "lucide-react";
import { useUserParts } from "@/hooks/use-user-parts";
import { format, parseISO } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { parseMaintenanceMachineString } from "@/utils/parts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PartHistory {
  uniqueKey: string;
  machineLabel: string;
  partTypeLabel: string;
  modelLabel: string;
  history: Date[];
}

const PartReplacementHistory = () => {
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
        
        // Ensure dateString is a non-empty string before parsing
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
  }, [userParts]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (historyData.length === 0) {
    return (
      <p className="text-center text-muted-foreground">
        No replacement history found for tracked parts.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {historyData.map((part) => (
        <Card key={part.uniqueKey}>
          <CardHeader>
            <CardTitle className="text-lg">
              {part.modelLabel} ({part.machineLabel})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="relative border-l border-muted-foreground/50 ml-2">
              {part.history.map((date, index) => (
                <li key={index} className="mb-4 ml-6">
                  <span className="absolute flex items-center justify-center w-3 h-3 bg-primary rounded-full -left-[6px] ring-8 ring-background">
                    <Calendar className="h-2 w-2 text-primary-foreground" />
                  </span>
                  <h3 className="font-semibold text-foreground">
                    Replaced {part.partTypeLabel}
                  </h3>
                  <time className="block mb-2 text-sm font-normal leading-none text-muted-foreground">
                    {format(date, "MMM dd, yyyy")}
                  </time>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PartReplacementHistory;