"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, subMonths, startOfMonth, isBefore, parseISO } from "date-fns";

interface ActivityData {
  name: string; // Month name (e.g., 'Jan 24')
  tasks: number; // Number of tasks completed that month
}

const MaintenanceActivityChart = () => {
  const [chartData, setChartData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndProcessData = async () => {
      setLoading(true);
      
      // Calculate the start date 12 months ago
      const twelveMonthsAgo = startOfMonth(subMonths(new Date(), 11));
      const twelveMonthsAgoISO = format(twelveMonthsAgo, 'yyyy-MM-dd');

      // Fetch all maintenance entries completed within the last 12 months
      const { data, error } = await supabase
        .from("maintenance_entries")
        .select("last_maintenance")
        .gte("last_maintenance", twelveMonthsAgoISO)
        .order("last_maintenance", { ascending: true });

      if (error) {
        console.error("Error fetching maintenance activity:", error);
        setLoading(false);
        return;
      }

      // 1. Initialize monthly buckets for the last 12 months
      const monthlyActivity = new Map<string, number>();
      const monthKeys: string[] = [];
      
      for (let i = 0; i < 12; i++) {
        const date = startOfMonth(subMonths(new Date(), 11 - i));
        const key = format(date, 'yyyy-MM'); // Key for grouping
        const label = format(date, 'MMM yy'); // Label for display
        monthlyActivity.set(key, 0);
        monthKeys.push(key);
      }
      
      // 2. Populate buckets
      data.forEach((entry) => {
        if (!entry.last_maintenance) return;

        // Use the last_maintenance date to determine the month of completion
        const completionDate = new Date(entry.last_maintenance.replace(/-/g, "/"));
        if (isNaN(completionDate.getTime())) return;

        const monthKey = format(startOfMonth(completionDate), 'yyyy-MM');
        
        if (monthlyActivity.has(monthKey)) {
          monthlyActivity.set(monthKey, monthlyActivity.get(monthKey)! + 1);
        }
      });

      // 3. Convert map to array for Recharts, ensuring correct order and labels
      const processedData: ActivityData[] = monthKeys
        .map((key) => {
          const date = parseISO(key);
          return {
            name: format(date, 'MMM yy'),
            tasks: monthlyActivity.get(key) || 0,
          };
        });

      setChartData(processedData);
      setLoading(false);
    };

    fetchAndProcessData();
  }, []);

  const totalTasks = chartData.reduce((sum, item) => sum + item.tasks, 0);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <History className="h-5 w-5 mr-2" /> Maintenance Activity (Last 12 Months)
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
            <History className="h-5 w-5 mr-2" /> Maintenance Activity (Last 12 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-muted-foreground">
            No maintenance activity recorded in the last 12 months.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <History className="h-5 w-5 mr-2" /> Maintenance Activity (Last 12 Months)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={chartData} 
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--foreground))" 
                fontSize={12} 
              />
              <YAxis 
                type="number" 
                stroke="hsl(var(--foreground))" 
                fontSize={12} 
                allowDecimals={false}
                label={{ value: 'Tasks Completed', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))', 
                  borderRadius: '0.5rem' 
                }}
                labelStyle={{ fontWeight: 'bold', color: 'hsl(var(--foreground))' }}
                formatter={(value) => [`${value} tasks`, 'Completed']}
              />
              <Line 
                type="monotone" 
                dataKey="tasks" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2} 
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MaintenanceActivityChart;