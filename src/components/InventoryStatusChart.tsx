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
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Warehouse } from "lucide-react";
import { useUserParts } from "@/hooks/use-user-parts";

interface ChartData {
  name: string;
  quantity: number;
  threshold: number;
}

const InventoryStatusChart = () => {
  const { userParts, loading: loadingUserParts } = useUserParts();
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loadingUserParts) return;

    const inventoryParts = userParts.filter(p => p.quantity !== undefined && p.reorderThreshold !== undefined);

    const data: ChartData[] = inventoryParts.map((part) => ({
      name: `${part.modelLabel} (${part.machineLabel})`,
      quantity: part.quantity!,
      threshold: part.reorderThreshold!,
    }));

    setChartData(data);
    setLoading(false);
  }, [userParts, loadingUserParts]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Warehouse className="h-5 w-5 mr-2" /> Inventory Status
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
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))' 
                  }}
                  formatter={(value, name) => {
                    if (name === 'quantity') return [`Current Stock: ${value}`, 'Quantity'];
                    if (name === 'threshold') return [`Reorder Threshold: ${value}`, 'Threshold'];
                    return [value, name];
                  }}
                />
                <Bar dataKey="quantity" fill="hsl(var(--primary))" name="quantity" />
                <Bar dataKey="threshold" fill="hsl(var(--yellow-500))" name="threshold" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InventoryStatusChart;