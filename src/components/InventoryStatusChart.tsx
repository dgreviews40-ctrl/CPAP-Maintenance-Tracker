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
  Cell, // Import Cell for individual bar coloring
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Package } from "lucide-react";

interface InventoryStatus {
  status: 'In Stock' | 'Below Threshold' | 'Out of Stock';
  count: number;
  color: string;
}

const InventoryStatusChart = () => {
  const [chartData, setChartData] = useState<InventoryStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndProcessData = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("part_inventory")
        .select("quantity, reorder_threshold");

      if (error) {
        console.error("Error fetching inventory for status chart:", error);
        setLoading(false);
        return;
      }

      if (data) {
        let inStockCount = 0;
        let belowThresholdCount = 0;
        let outOfStockCount = 0;

        data.forEach((item: { quantity: number, reorder_threshold: number }) => {
          if (item.quantity <= 0) {
            outOfStockCount++;
          } else if (item.quantity <= item.reorder_threshold) {
            belowThresholdCount++;
          } else {
            inStockCount++;
          }
        });

        // Fix 1: Use 'as const' to ensure literal types are inferred correctly
        const processedData = [
          { status: 'In Stock', count: inStockCount, color: 'hsl(var(--primary))' },
          { status: 'Below Threshold', count: belowThresholdCount, color: 'hsl(var(--yellow-500))' },
          { status: 'Out of Stock', count: outOfStockCount, color: 'hsl(var(--destructive))' },
        ] as const;
        
        setChartData(processedData.filter(d => d.count > 0) as InventoryStatus[]);
      }
      setLoading(false);
    };

    fetchAndProcessData();
  }, []);

  if (loading) {
    return (
      <Card className="w-full mt-6">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Package className="h-5 w-5 mr-2" /> Inventory Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (chartData.length === 0) {
    return (
      <Card className="w-full mt-6">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Package className="h-5 w-5 mr-2" /> Inventory Status
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

  const totalParts = chartData.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Package className="h-5 w-5 mr-2" /> Inventory Status ({totalParts} Parts Tracked)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData} 
              layout="vertical"
              margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" horizontal={false} />
              <XAxis 
                type="number" 
                stroke="hsl(var(--foreground))" 
                fontSize={12} 
                allowDecimals={false}
              />
              <YAxis 
                dataKey="status" 
                type="category" 
                stroke="hsl(var(--foreground))" 
                fontSize={12} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))', 
                  borderRadius: '0.5rem' 
                }}
                labelStyle={{ fontWeight: 'bold', color: 'hsl(var(--foreground))' }}
                formatter={(value, name, props) => {
                  const status = props.payload.status;
                  return [`${value} parts`, status];
                }}
              />
              {/* Fix 2: Use a single Bar component and map over Cells to apply color */}
              <Bar 
                dataKey="count" 
                name="Count"
                radius={[4, 4, 4, 4]} 
                label={{ position: 'right', fill: 'hsl(var(--foreground))' }}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryStatusChart;