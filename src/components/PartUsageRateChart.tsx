"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp } from "lucie-react";
import { differenceInDays, parseISO } from "date-fns";
import { useCustomFrequencies } from "@/hooks/use-custom-frequencies";
import { getMaintenanceFrequencyDays } from "@/utils/frequency";
import { parseMaintenanceMachineString } from "@/utils/parts";

interface UsageData {
  part: string;
  actual_days: number;
  recommended_days: number;
}

const PartUsageRateChart = ({ dataRefreshKey }: { dataRefreshKey: number }) => {
  const { frequencies, loading: loadingFrequencies } = useCustomFrequencies();
  const [chartData, setChartData] = useState<UsageData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loadingFrequencies) return;

    const fetchAndProcessData = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("maintenance_entries")
        .select("machine, last_maintenance")
        .order("last_maintenance", { ascending: true });

      if (error) {
        console.error("Error fetching maintenance entries for usage chart:", error);
        setLoading(false);
        return;
      }

      if (data && data.length > 1) {
        const groupedEntries: Record<string, { dates: Date[], recommended: number }> = {};

        data.forEach((entry) => {
          const { machineLabel, partTypeLabel, modelLabel } = parseMaintenanceMachineString(entry.machine);
          if (!machineLabel || !partTypeLabel || !modelLabel) return;

          const partKey = `${machineLabel}|${partTypeLabel}|${modelLabel}`;
          const maintenanceDate = parseISO(entry.last_maintenance.replace(/-/g, "/"));
          if (isNaN(maintenanceDate.getTime())) return;

          // Determine the recommended frequency: Custom > Default > 30 days (fallback)
          const defaultDays = getMaintenanceFrequencyDays(partTypeLabel) || 30;
          const recommendedDays = frequencies[partKey] || defaultDays;

          if (!groupedEntries[partKey]) {
            groupedEntries[partKey] = { dates: [], recommended: recommendedDays };
          }
          groupedEntries[partKey].dates.push(maintenanceDate);
        });

        const processedData: UsageData[] = [];

        Object.entries(groupedEntries).forEach(([key, { dates, recommended }]) => {
          // Ensure dates are sorted
          dates.sort((a, b) => a.getTime() - b.getTime());

          if (dates.length > 1) {
            let totalIntervalDays = 0;
            // Calculate the interval between consecutive replacements
            for (let i = 1; i < dates.length; i++) {
              totalIntervalDays += differenceInDays(dates[i], dates[i - 1]);
            }
            
            const averageInterval = Math.round(totalIntervalDays / (dates.length - 1));
            
            const [machineLabel, partTypeLabel, partModelLabel] = key.split('|');
            
            processedData.push({
              part: `${partModelLabel} (${machineLabel})`,
              actual_days: averageInterval,
              recommended_days: recommended,
            });
          }
        });
        
        setChartData(processedData);
      }
      setLoading(false);
    };

    fetchAndProcessData();
  }, [loadingFrequencies, frequencies, dataRefreshKey]);

  const loading = loadingFrequencies;

  if (chartData.length === 0 && !loading) {
    return (
      <Card className="w-full mt-6">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <TrendingUp className="h-5 w-5 mr-2" /> Part Usage Rate Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-muted-foreground">
            Need at least two maintenance entries for a part to calculate usage rate.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <TrendingUp className="h-5 w-5 mr-2" /> Part Usage Rate Comparison (Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData} 
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" vertical={false} />
              <XAxis 
                dataKey="part" 
                stroke="hsl(var(--foreground))" 
                fontSize={12} 
                tickFormatter={(value) => value.split('(')[0].trim()} // Clean up label
              />
              <YAxis 
                type="number" 
                stroke="hsl(var(--foreground))" 
                fontSize={12} 
                allowDecimals={false}
                label={{ value: 'Days', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))', 
                  borderRadius: '0.5rem' 
                }}
                labelStyle={{ fontWeight: 'bold', color: 'hsl(var(--foreground))' }}
                formatter={(value, name) => {
                  if (name === 'Actual') return [`${value} days`, 'Actual Replacement Interval'];
                  if (name === 'Recommended') return [`${value}`, 'Target Interval'];
                  return value;
                }}
              />
              <Legend />
              <Bar 
                dataKey="actual_days" 
                name="Actual"
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]} 
              />
              <Bar 
                dataKey="recommended_days" 
                name="Recommended"
                fill="hsl(var(--secondary))" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PartUsageRateChart;