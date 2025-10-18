"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useUserParts } from "@/hooks/use-user-parts";
import { Loader2 } from "lucide-react";

// Define the structure for the data
interface PartTypeData {
  name: string;
  value: number;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

// Custom Tooltip Component to ensure readability
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-2 bg-white border border-gray-300 shadow-lg rounded-md text-gray-900">
        <p className="font-semibold">{`${data.name}`}</p>
        <p className="text-sm">{`Total Parts: ${data.value}`}</p>
      </div>
    );
  }

  return null;
};


const PartTypeBreakdownChart = () => {
  const { userParts, loading } = useUserParts();

  if (loading) {
    return (
      <Card className="w-full h-96 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </Card>
    );
  }

  // Aggregate data by part type
  const partTypeCounts = userParts.reduce((acc, part) => {
    // FIX: Use partTypeLabel instead of part_type_label
    const type = part.partTypeLabel;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Cast value to number to satisfy PartTypeData interface
  const chartData: PartTypeData[] = Object.entries(partTypeCounts).map(([name, value]) => ({
    name,
    value: value as number,
  }));

  if (chartData.length === 0) {
    return (
      <Card className="w-full h-96 flex items-center justify-center">
        <p className="text-muted-foreground">No parts defined yet.</p>
      </Card>
    );
  }

  return (
    <Card className="w-full h-96">
      <CardHeader>
        <CardTitle>Part Type Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-70px)]">
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
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend layout="vertical" align="right" verticalAlign="middle" />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default PartTypeBreakdownChart;