"use client";

import { useMemo } from "react";
import { Loader2, Calendar } from "lucide-react";
import { useUserParts } from "@/hooks/use-user-parts";
import { useMaintenanceHistory, MaintenanceEntry } from "@/hooks/use-maintenance-history";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PartHistoryDisplay {
  uniqueKey: string;
  machineLabel: string;
  partTypeLabel: string;
  modelLabel: string;
  history: MaintenanceEntry[];
}

// Helper function to safely format date strings
const safeFormatDate = (dateStr: string | undefined, formatString: string = 'MMM dd, yyyy'): string => {
  if (!dateStr) return "N/A";
  // Handle timezone issues by replacing hyphens with slashes
  const date = new Date(dateStr.replace(/-/g, "/"));
  if (isNaN(date.getTime())) return "Invalid Date";
  return format(date, formatString);
};

const PartReplacementHistory = () => {
  const { userParts, loading: loadingUserParts } = useUserParts();
  const { history: maintenanceHistoryMap, loading: loadingMaintenanceHistory } = useMaintenanceHistory();

  const loading = loadingUserParts || loadingMaintenanceHistory;

  const historyData = useMemo<PartHistoryDisplay[]>(() => {
    if (loading) return [];

    const processedHistory: PartHistoryDisplay[] = userParts.map((part) => {
      const entries = maintenanceHistoryMap[part.uniqueKey] || [];
      
      // Entries from useMaintenanceHistory are already sorted by last_maintenance descending.
      // Take the top 5 most recent entries.
      const recentEntries = entries.slice(0, 5);
      
      return {
        uniqueKey: part.uniqueKey,
        machineLabel: part.machineLabel,
        partTypeLabel: part.partTypeLabel,
        modelLabel: part.modelLabel,
        history: recentEntries,
      };
    }).filter((p) => p.history.length > 0);

    return processedHistory;
  }, [userParts, maintenanceHistoryMap, loading]);


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
              {part.history.map((entry) => (
                <li key={entry.id} className="mb-4 ml-6">
                  <span className="absolute flex items-center justify-center w-3 h-3 bg-primary rounded-full -left-[6px] ring-8 ring-background">
                    <Calendar className="h-2 w-2 text-primary-foreground" />
                  </span>
                  <h3 className="font-semibold text-foreground">
                    Replaced {part.partTypeLabel}
                  </h3>
                  <time className="block mb-2 text-sm font-normal leading-none text-muted-foreground">
                    {safeFormatDate(entry.last_maintenance)}
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