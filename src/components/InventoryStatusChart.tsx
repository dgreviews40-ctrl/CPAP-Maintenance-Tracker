"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
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
import { useAuth } from "@/hooks/use-auth";
import { useUserParts } from "@/hooks/use-user-parts";

interface ChartData {
  name: string;
  quantity: number;
  threshold: number;
}

const InventoryStatusChart = () => {
  const { user } = useAuth();
  const { userParts, loading: loadingUserParts } = useUserParts();
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loadingUserParts) return;

    // Transform userParts data for the chart
    const data: ChartData[] = userParts.map((part) => ({
      name: `${part.modelLabel} (${part.machineLabel})`,
      quantity: part.quantity,
      threshold: part.reorderThreshold,
    }));

    setChartData(data);
    setLoading(false);
  }, [userParts, loadingUserParts]);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="text-muted-foreground p-4">
        No parts in inventory to display status.
      </div>
    );
  }

  return (
    <>
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
              formatter={(value, name, props) => {
                if (name === 'quantity') return [`Current Stock: ${value}`, 'Quantity'];
                if (name === 'threshold') return [`Reorder Threshold: ${value}`, 'Threshold'];
                return [value, name];
              }}
            />
            <Bar dataKey="quantity" fill="#3b82f6" name="quantity" />
            <Bar dataKey="threshold" fill="#f59e0b" name="threshold" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default InventoryStatusChart;