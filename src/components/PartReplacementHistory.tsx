"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, History, Calendar } from "lucide-react";
import { useUserParts } from "@/hooks/use-user-parts";
import { format, parseISO } from "date-fns";
import { Separator } from "@/components/ui/separator";

interface MaintenanceHistory {
  last_maintenance: string;
}

interface PartHistory {
  uniqueKey: string;
  machineLabel: string;
  partTypeLabel: string;
  modelLabel: string;
  history: Date[];
}

// Helper to parse the machine string back into its components
const parseMachineStringForHistory = (machineString: string) => {
  // Expected format: "Machine Label - Part Type Label - Part Model Label (SKU: XXX)"
  const parts = machineString.split(' - ');
  
  const machine = parts[0]?.trim() || "";
  const partType = parts[1]?.trim() || "";
  
  // Remove SKU info from part model
  const partModelWithSku = parts[2]?.trim() || "";
  const partModel = partModelWithSku.replace(/\s*\(SKU:.*\)/, '').trim();

  return { machine, partType, partModel };
};


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
      const { machine, partType, partModel } = parseMachineStringForHistory(entry.machine);
      if (machine && partType && partModel) {
        const key = `${machine}|${partType}|${partModel}`;
        
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
      <Card className="w-full mt-6">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <History className="h-5 w-5 mr-2" /> Part Replacement History
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
  
  if (historyData.length === 0) {
    return (
      <Card className="w-full mt-6">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <History className="h-5 w-5 mr-2" /> Part Replacement History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">
            No replacement history found. Add maintenance entries to start tracking.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <History className="h-5 w-5 mr-2" /> Part Replacement History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {historyData.map((part, index) => (
          <div key={part.uniqueKey}>
            <h4 className="font-semibold text-md mb-2">
              {part.modelLabel} ({part.machineLabel})
            </h4>
            <div className="flex flex-wrap gap-2">
              {part.history.map((date, dateIndex) => (
                <div 
                  key={dateIndex} 
                  className="flex items-center text-sm bg-secondary p-2 rounded-md text-secondary-foreground"
                >
                  <Calendar className="h-4 w-4 mr-1 text-primary" />
                  {format(date, 'MMM dd, yyyy')}
                </div>
              ))}
            </div>
            {index < historyData.length - 1 && <Separator className="mt-4" />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PartReplacementHistory;