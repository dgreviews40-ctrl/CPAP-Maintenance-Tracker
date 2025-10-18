"use client";

import { useEffect, useState } from "react";
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
import { Loader2, Warehouse } from "lucide-react";
import { useUserParts } from "@/hooks/use-user-parts";
import InventoryChartTooltip from "./InventoryChartTooltip"; // Import custom tooltip

interface ChartData {
  name: string;
  quantity: number;
  threshold: number;
  uniqueKey: string; // Added uniqueKey
}

const InventoryStatusChart = () => {
  const { userParts, loading: loadingUserParts } = useUserParts();
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loadingUserParts) return;

    // Filter parts that are tracked in inventory (have quantity and threshold defined)
    const inventoryParts = userParts.filter(p => p.quantity !== undefined && p.reorderThreshold !== undefined);

    const data: ChartData[] = inventoryParts.map((part) => ({
      // Use a combined label for clarity
      name: `${part.modelLabel} (${part.machineLabel})`,
      quantity: part.quantity!,
      threshold: part.reorderThreshold!,
      uniqueKey: part.uniqueKey, // Pass the unique key
    }));

    setChartData(data);
    setLoading(false);
  }, [userParts, loadingUserParts]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Warehouse className="h-5 w-5 mr-2" /> Inventory Status vs. Threshold
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No parts in inventory to display status.
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis type="number" stroke="hsl(var(--foreground))" allowDecimals={false} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={150} 
                  tick={{ fontSize: 10 }} 
                  stroke="hsl(var(--foreground))"
                  // Truncate long labels for vertical axis
                  tickFormatter={(value) => value.length > 20 ? value.substring(0, 17) + '...' : value}
                />
                <Tooltip 
                  content={InventoryChartTooltip} // <-- Fixed: Pass component reference, not JSX
                />
                <Legend />
                <Bar dataKey="quantity" fill="hsl(var(--primary))" name="Quantity" />
                <Bar dataKey="threshold" fill="hsl(var(--yellow-500))" name="Threshold" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InventoryStatusChart;