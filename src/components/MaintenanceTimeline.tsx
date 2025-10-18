"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CalendarDays } from "lucide-react";
import { useUserParts } from "@/hooks/use-user-parts";
import { format, parseISO, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { parseMaintenanceMachineString } from "@/utils/parts"; // Import canonical utility

interface ReplacementEvent {
  date: Date;
  intervalDays: number | null; // Days since the previous replacement
}

interface PartHistory {
  uniqueKey: string;
  machineLabel: string;
  partTypeLabel: string;
  modelLabel: string;
  history: ReplacementEvent[];
}

// --- Data Fetching Logic ---

const useMaintenanceHistory = () => {
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
    
    const { data, error } = await supabase
      .from("maintenance_entries")
      .select("machine, last_maintenance")
      .order("last_maintenance", { ascending: true }); // Ascending order is crucial for interval calculation

    if (error) {
      console.error("Error fetching maintenance history:", error);
      setLoading(false);
      return;
    }

    const rawHistoryMap = new Map<string, Date[]>();

    data.forEach((entry) => {
      const { machineLabel, partTypeLabel, modelLabel } = parseMaintenanceMachineString(entry.machine);
      
      if (machineLabel && partTypeLabel && modelLabel) {
        const key = `${machineLabel}|${partTypeLabel}|${modelLabel}`;
        
        const dateString = entry.last_maintenance?.replace(/-/g, "/");
        if (!dateString) return;

        const date = parseISO(dateString);
        
        if (isNaN(date.getTime())) {
            console.warn("Skipping invalid date entry:", entry);
            return;
        }
        
        if (!rawHistoryMap.has(key)) {
          rawHistoryMap.set(key, []);
        }
        rawHistoryMap.get(key)?.push(date);
      }
    });

    const processedHistory: PartHistory[] = userParts.map(part => {
      const rawDates = rawHistoryMap.get(part.uniqueKey) || [];
      // Ensure dates are sorted chronologically (ascending)
      rawDates.sort((a, b) => a.getTime() - b.getTime());
      
      const replacementEvents: ReplacementEvent[] = rawDates.map((date, index) => {
        let intervalDays: number | null = null;
        if (index > 0) {
          // Calculate days since the previous replacement
          intervalDays = differenceInDays(date, rawDates[index - 1]);
        }
        return { date, intervalDays };
      });
      
      return {
        ...part,
        history: replacementEvents,
      };
    }).filter(p => p.history.length > 0);

    setHistoryData(processedHistory);
    setLoading(false);
  }, [userParts]);

  useEffect(() => {
    if (!loadingUserParts) {
      fetchHistory();
    }
  }, [loadingUserParts, fetchHistory]);
  
  return { historyData, loading: loading || loadingUserParts };
};

// --- Timeline Component ---

const MaintenanceTimeline = () => {
  const { historyData, loading } = useMaintenanceHistory();
  const [timeRange, setTimeRange] = useState<{ start: Date, end: Date } | null>(null);

  // 1. Determine the overall time range for the timeline
  useEffect(() => {
    if (historyData.length === 0) {
      setTimeRange(null);
      return;
    }

    let minDate: Date | null = null;
    let maxDate: Date | null = null;

    historyData.forEach(part => {
      part.history.forEach(event => {
        const date = event.date;
        if (!minDate || date < minDate) minDate = date;
        if (!maxDate || date > maxDate) maxDate = date;
      });
    });

    if (minDate && maxDate) {
      // Set range from the start of the earliest month to the end of the current month
      const start = startOfMonth(minDate);
      const end = endOfMonth(new Date());
      setTimeRange({ start, end });
    }
  }, [historyData]);

  if (loading) {
    return (
      <Card className="w-full mt-6">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <CalendarDays className="h-5 w-5 mr-2" /> Maintenance Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (historyData.length === 0 || !timeRange) {
    return null; // Render nothing if no history exists
  }

  const allDays = eachDayOfInterval(timeRange);
  const totalDays = allDays.length;

  // Calculate the width of each day in the timeline (min 10px)
  const dayWidth = Math.max(10, 800 / totalDays); 

  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <CalendarDays className="h-5 w-5 mr-2" /> Maintenance Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto pb-4">
          <div style={{ width: `${totalDays * dayWidth}px`, minWidth: '100%' }} className="relative">
            
            {/* Timeline Header (Months/Days) */}
            <div className="flex sticky left-0 z-10 bg-card border-b border-border">
              {allDays.map((day, index) => {
                const isMonthStart = isSameDay(day, startOfMonth(day));
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div 
                    key={index} 
                    style={{ width: `${dayWidth}px` }} 
                    className={cn(
                      "flex flex-col items-center justify-end text-xs h-12 border-r border-dashed border-muted-foreground/20",
                      isToday && "bg-primary/10"
                    )}
                  >
                    {isMonthStart && (
                      <span className="absolute top-0 -translate-x-1/2 font-semibold text-primary">
                        {format(day, 'MMM')}
                      </span>
                    )}
                    <span className={cn("text-[10px]", isToday && "font-bold text-primary")}>
                        {format(day, 'd')}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Part Timelines */}
            <div className="space-y-4 pt-4">
              {historyData.map((part) => (
                <div key={part.uniqueKey} className="relative h-10">
                  <div className="absolute left-0 w-40 text-sm font-medium truncate pr-2 h-full flex items-center justify-end">
                    {part.modelLabel}
                  </div>
                  
                  <div className="ml-40 h-full relative">
                    {/* Background bar representing the entire period */}
                    <div className="absolute inset-0 bg-muted/50 rounded-full h-2 top-1/2 -translate-y-1/2" />
                    
                    {/* Replacement Markers */}
                    {part.history.map((event, index) => {
                      const daysFromStart = differenceInDays(event.date, timeRange.start);
                      const position = daysFromStart * dayWidth;
                      
                      const tooltipText = event.intervalDays !== null
                        ? `Replaced: ${format(event.date, 'MMM dd, yyyy')} (${event.intervalDays} days interval)`
                        : `First Replacement: ${format(event.date, 'MMM dd, yyyy')}`;
                      
                      return (
                        <div 
                          key={index}
                          style={{ left: `${position}px` }}
                          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-6 w-6 bg-primary rounded-full flex items-center justify-center shadow-lg cursor-pointer group"
                          title={tooltipText}
                        >
                          <CalendarDays className="h-3 w-3 text-primary-foreground" />
                          
                          {/* Tooltip/Label */}
                          <span className="absolute bottom-full mb-2 p-1 px-2 bg-card border border-border rounded-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            {tooltipText}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MaintenanceTimeline;