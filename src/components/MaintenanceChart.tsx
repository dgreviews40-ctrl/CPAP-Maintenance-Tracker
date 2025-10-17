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
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, subYears, startOfMonth, getMonth, getYear } from "date-fns";
import { Loader2, BarChart3 } from "lucide-react";

interface ChartData {
  name: string;
  count: number;
}

const MaintenanceChart = () => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndProcessData = async () => {
      setLoading(true);
      
      // Calculate the date one year ago to limit the data fetched
      const oneYearAgo = format(subYears(new Date(), 1), 'yyyy-MM-dd');

      // Fetch all entries created in the last year
      const { data, error } = await supabase
        .from("maintenance_entries")
        .select("created_at")
        .gte("created_at", oneYearAgo);

      if (error) {
        console.error("Error fetching maintenance entries for chart:", error);
        setLoading(false);
        return;
      }

      if (data) {
        // Initialize data structure for the last 12 months
        const monthlyCounts: { [key: string]: number } = {};
        const today = new Date();
        
        for (let i = 0; i < 12; i++) {
          const date = startOfMonth(subYears(today, 1));
          const monthDate = startOfMonth(new Date(getYear(date), getMonth(date) + i));
          const key = format(monthDate, 'MMM yyyy');
          monthlyCounts[key] = 0;
        }

        // Count entries per month
        data.forEach((entry: { created_at: string }) => {
          const date = new Date(entry.created_at);
          const key = format(startOfMonth(date), 'MMM yyyy');
          if (monthlyCounts.hasOwnProperty(key)) {
            monthlyCounts[key]++;
          }
        });

        // Convert to array format for Recharts
        const processedData: ChartData[] = Object.keys(monthlyCounts)
          .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
          .map(key => ({
            name: format(new Date(key), 'MMM'), // Display only month name on X-axis
            count: monthlyCounts[key],
          }));
          
        setChartData(processedData);
      }
      setLoading(false);
    };

    fetchAndProcessData();
  }, []);

  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <BarChart3 className="h-5 w-5 mr-2" /> Maintenance History (Last 12 Months)
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
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--foreground))" fontSize={12} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))', 
                    borderRadius: '0.5rem' 
                  }}
                  labelStyle={{ fontWeight: 'bold', color: 'hsl(var(--foreground))' }}
                  itemStyle={{ color: 'hsl(var(--primary))' }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MaintenanceChart;