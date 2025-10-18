"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, PieChart as PieChartIcon } from "lucide-react";
import { useUserParts } from "@/hooks/use-user-parts";

interface PartTypeData {
  name: string;
  value: number;
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FF6384",
  "#36A2EB",
];

const PartTypeBreakdownChart = () => {
  const { userParts, loading } = useUserParts();

  const chartData = useMemo<PartTypeData[]>(() => {
    if (loading) return [];

    const counts: Record<string, number> = {};
    userParts.forEach((part) => {
      const type = part.partTypeLabel;
      counts[type] = (counts[type] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [userParts, loading]);

  if (loading) {
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
        <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
          No parts tracked yet.
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
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%" // Centered
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))', 
                  borderRadius: '0.5rem' 
                }}
                labelStyle={{ fontWeight: 'bold', color: 'hsl(var(--foreground))' }}
                formatter={(value, name, props) => [`${value} parts`, props.payload.name]}
              />
              <Legend 
                layout="horizontal" 
                verticalAlign="top" 
                align="center" 
                wrapperStyle={{ paddingTop: '0px' }} // Remove previous padding
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PartTypeBreakdownChart;