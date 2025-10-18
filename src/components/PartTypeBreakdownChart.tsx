"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, PieChart as PieChartIcon } from "lucide-react";
import { useMaintenanceHistory } from "@/hooks/use-maintenance-history";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { parseMaintenanceMachineString } from "@/utils/parts";

// Define colors for the chart segments
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface ChartData {
  name: string;
  value: number;
}

const PartTypeBreakdownChart = () => {
  const { history, loading: loadingHistory } = useMaintenanceHistory();

  const chartData = useMemo<ChartData[]>(() => {
    if (loadingHistory) return [];

    const partTypeCounts = new Map<string, number>();
    
    // Flatten all maintenance entries
    const allEntries = Object.values(history).flat();

    allEntries.forEach(entry => {
      const { partTypeLabel } = parseMaintenanceMachineString(entry.machine);
      if (partTypeLabel) {
        partTypeCounts.set(partTypeLabel, (partTypeCounts.get(partTypeLabel) || 0) + 1);
      }
    });

    // Convert map to array format for Recharts
    const data: ChartData[] = Array.from(partTypeCounts.entries()).map(([name, value]) => ({
      name,
      value,
    }));
    
    // Sort by value descending
    return data.sort((a, b) => b.value - a.value);
  }, [history, loadingHistory]);

  if (loadingHistory) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <PieChartIcon className="h-5 w-5 mr-2" /> Part Type Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  if (chartData.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <PieChartIcon className="h-5 w-5 mr-2" /> Part Type Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-muted-foreground">
            No maintenance history recorded to generate breakdown.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <PieChartIcon className="h-5 w-5 mr-2" /> Part Type Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value, name, props) => [`${value} entries`, name]}
              contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '0.5rem' }}
            />
            <Legend layout="vertical" verticalAlign="middle" align="right" />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default PartTypeBreakdownChart;