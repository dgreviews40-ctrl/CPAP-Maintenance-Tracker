"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Calendar } from "lucide-react";
import { useUserParts } from "@/hooks/use-user-parts";
import { format, parseISO } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { parseMaintenanceMachineString } from "@/utils/parts"; // Import canonical utility

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

  const fetchHistory = useCallback(async () => {
    if (userParts.length === 0) {
      setHistoryData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Fetch all maintenance entries
    const { data, error } = await supabase
      .from("maintenance_entries")
      .select("machine, last_maintenance")
      .order("last_maintenance", { ascending: false }); // Newest first

    if (error) {
      console.error("Error fetching maintenance history:", error);
      setLoading(false);
      return;
    }

    const historyMap = new Map<string, Date[]>();

    // Group maintenance dates by unique part key
    data.forEach((entry) => {
      const { machineLabel, partTypeLabel, modelLabel } = parseMaintenanceMachineString(entry.machine);
      
      if (machineLabel && partTypeLabel && modelLabel) {
        const key = `${machineLabel}|${partTypeLabel}|${modelLabel}`;
        
        // Ensure date string is present and handle timezone adjustment for parsing
        const dateString = entry.last_maintenance?.replace(/-/g, "/");
        if (!dateString) return;

        const date = parseISO(dateString);
        
        // Validate the parsed date object before pushing
        if (isNaN(date.getTime())) {
            console.warn("Skipping invalid date entry:", entry);
            return;
        }
        
        if (!historyMap.has(key)) {
          historyMap.set(key, []);
        }
        historyMap.get(key)?.push(date);
      }
    });

    // Map back to the structure using userParts data
    const processedHistory: PartHistory[] = userParts.map(part => {
      const dates = historyMap.get(part.uniqueKey) || [];
      // Sort dates newest to oldest and take the last 5
      dates.sort((a, b) => b.getTime() - a.getTime());
      
      return {
        ...part,
        history: dates.slice(0, 5), // Show up to the last 5 replacements
      };
    }).filter(p => p.history.length > 0); // Only show parts with history

    setHistoryData(processedHistory);
    setLoading(false);
  }, [userParts]);

  useEffect(() => {
    if (!loadingUserParts) {
      fetchHistory();
    }
  }, [loadingUserParts, fetchHistory]);

  if (loading || loadingUserParts) {
    return (
      <div className="p-4 flex items-center justify-center h-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (historyData.length === 0) {
    return (
      <div className="p-4 text-muted-foreground">
        No replacement history found. Add maintenance entries to start tracking.
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {historyData.map((part, index) => (
        <div key={part.uniqueKey}>
          <h4 className="font-semibold text-sm mb-1 truncate">
            {part.modelLabel} ({part.machineLabel})
          </h4>
          <div className="flex flex-wrap gap-1">
            {part.history.map((date, dateIndex) => (
              <div 
                key={dateIndex} 
                className="flex items-center text-xs bg-secondary p-1 rounded-md text-secondary-foreground"
              >
                <Calendar className="h-3 w-3 mr-1 text-primary" />
                {format(date, 'MMM dd, yyyy')}
              </div>
            ))}
          </div>
          {index < historyData.length - 1 && <Separator className="mt-3" />}
        </div>
      ))}
    </div>
  );
};

export default PartReplacementHistory;