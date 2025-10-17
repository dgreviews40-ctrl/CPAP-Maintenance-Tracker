"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
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
import { Loader2, TrendingUp } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";

interface UsageData {
  part: string;
  actual_days: number;
  recommended_days: number;
}

// Simplified mapping based on part name in the 'machine' string
const getRecommendedFrequency = (machineLabel: string): number | null => {
  const lowerLabel = machineLabel.toLowerCase();
  if (lowerLabel.includes("filter")) return 30;
  if (lowerLabel.includes("mask")) return 90;
  if (lowerLabel.includes("tubing") || lowerLabel.includes("hose")) return 90;
  if (lowerLabel.includes("water chamber")) return 180;
  return null; // Unknown part type
};

const PartUsageRateChart = () => {
  const [chartData, setChartData] = useState<UsageData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndProcessData = async () => {
      setLoading(true);
      
      // Fetch all maintenance entries, ordered by date
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
          const recommended = getRecommendedFrequency(entry.machine);
          if (recommended === null) return; // Skip parts we can't categorize

          // Use part model label as key (assuming format "Machine - Part Model Label")
          const partKey = entry.machine.split(' - ')[1] || entry.machine; 
          const maintenanceDate = parseISO(entry.last_maintenance.replace(/-/g, "/"));

          if (!groupedEntries[partKey]) {
            groupedEntries[partKey] = { dates: [], recommended };
          }
          groupedEntries[partKey].dates.push(maintenanceDate);
        });

        const processedData: UsageData[] = [];

        Object.entries(groupedEntries).forEach(([part, { dates, recommended }]) => {
          // Ensure dates are sorted
          dates.sort((a, b) => a.getTime() - b.getTime());

          if (dates.length > 1) {
            let totalIntervalDays = 0;
            // Calculate the interval between consecutive replacements
            for (let i = 1; i < dates.length; i++) {
              totalIntervalDays += differenceInDays(dates[i], dates[i - 1]);
            }
            
            const averageInterval = Math.round(totalIntervalDays / (dates.length - 1));
            
            processedData.push({
              part: part.length > 20 ? part.substring(0, 20) + '...' : part,
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
  }, []);

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
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
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
                    if (name === 'Recommended') return [`${value} days`, 'Recommended Interval'];
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
                  opacity={0.8}
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PartUsageRateChart;