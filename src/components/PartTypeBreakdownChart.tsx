"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, PieChart as PieChartIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { parseMaintenanceMachineString } from "@/utils/parts";
import { useMaintenanceHistory } from "@/hooks/use-maintenance-history";

interface BreakdownData {
  name: string; // Part Type Label (e.g., 'Filter', 'Tubing')
  value: number; // Count of maintenance tasks for this part type
}

// Define colors for the chart slices (using Tailwind colors)
const COLORS = [
  "hsl(var(--primary))", 
  "hsl(var(--secondary))", 
  "hsl(var(--yellow-500))", 
  "hsl(var(--destructive))",
  "hsl(210 40% 98%)", // Light gray/off-white for dark mode contrast
  "hsl(217 33% 17%)", // Muted blue
];

const PartTypeBreakdownChart = () => {
  const { history, loading: loadingHistory } = useMaintenanceHistory();
  const [chartData, setChartData] = useState<BreakdownData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loadingHistory) return;

    const allEntries = Object.values(history).flat();
    const breakdownMap = new Map<string, number>();

    allEntries.forEach(entry => {
      // We only care about the part type label for this chart
      const { partTypeLabel } = parseMaintenanceMachineString(entry.machine);
      
      if (partTypeLabel) {
        const currentCount = breakdownMap.get(partTypeLabel) || 0;
        breakdownMap.set(partTypeLabel, currentCount + 1);
      }
    });

    const processedData: BreakdownData[] = Array.from(breakdownMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Sort by count descending

    setChartData(processedData);
    setLoading(false);
  }, [history, loadingHistory]);

  const totalTasks = chartData.reduce((sum, item) => sum + item.value, 0);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <PieChartIcon className="h-5 w-5 mr-2" /> Maintenance Breakdown by Part Type
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (totalTasks === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <PieChartIcon className="h-5 w-5 mr-2" /> Maintenance Breakdown by Part Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-muted-foreground">
            No maintenance history recorded to calculate part breakdown.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <PieChartIcon className="h-5 w-5 mr-2" /> Maintenance Breakdown by Part Type
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))', 
                  borderRadius: '0.5rem' 
                }}
                formatter={(value, name, props) => [`${value} tasks`, props.payload.name]}
              />
              <Legend layout="vertical" align="right" verticalAlign="middle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PartTypeBreakdownChart;