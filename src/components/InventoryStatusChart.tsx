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
import { Loader2, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface InventoryData {
  name: string; // Part Model Label
  stock: number;
  threshold: number;
  needsReorder: boolean;
}

const InventoryStatusChart = () => {
  const [chartData, setChartData] = useState<InventoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndProcessData = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("part_inventory")
        .select("part_model_label, quantity, reorder_threshold")
        .order("quantity", { ascending: true });

      if (error) {
        console.error("Error fetching inventory for chart:", error);
        setLoading(false);
        return;
      }

      if (data) {
        const processedData: InventoryData[] = data.map((item) => ({
          name: item.part_model_label,
          stock: item.quantity,
          threshold: item.reorder_threshold,
          needsReorder: item.quantity <= item.reorder_threshold,
        }));
          
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
            <Package className="h-5 w-5 mr-2" /> Part Inventory Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-muted-foreground">
            No parts tracked in inventory yet.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Package className="h-5 w-5 mr-2" /> Part Inventory Status
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
                layout="vertical"
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis 
                  type="number" 
                  stroke="hsl(var(--foreground))" 
                  fontSize={12} 
                  allowDecimals={false}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="hsl(var(--foreground))" 
                  fontSize={12} 
                  width={120}
                  tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))', 
                    borderRadius: '0.5rem' 
                  }}
                  labelStyle={{ fontWeight: 'bold', color: 'hsl(var(--foreground))' }}
                  formatter={(value, name, props) => {
                    if (name === 'Stock') {
                      return [value, 'Current Stock'];
                    }
                    if (name === 'Threshold') {
                      return [value, 'Reorder Threshold'];
                    }
                    return value;
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="stock" 
                  name="Stock"
                  fill="hsl(var(--primary))" 
                  radius={[0, 4, 4, 0]} 
                />
                <Bar 
                  dataKey="threshold" 
                  name="Threshold"
                  fill="hsl(var(--destructive))" 
                  opacity={0.5}
                  radius={[0, 4, 4, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InventoryStatusChart;