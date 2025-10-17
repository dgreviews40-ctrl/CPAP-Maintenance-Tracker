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
import { Loader2, CalendarClock } from "lucide-react";
import { format, isFuture, startOfMonth, addMonths } from "date-fns";

interface ForecastData {
  month: string;
  tasks: number;
}

const MaintenanceForecastChart = () => {
  const [chartData, setChartData] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndProcessData = async () => {
      setLoading(true);
      
      // Fetch all maintenance entries that are due in the future (or today)
      const { data, error } = await supabase
        .from("maintenance_entries")
        .select("next_maintenance")
        .gte("next_maintenance", format(new Date(), 'yyyy-MM-dd'));

      if (error) {
        console.error("Error fetching maintenance entries for forecast:", error);
        setLoading(false);
        return;
      }

      if (data) {
        const taskCounts: Record<string, number> = {};
        const today = new Date();
        const sixMonthsFromNow = addMonths(today, 6);

        data.forEach((entry: { next_maintenance: string }) => {
          const nextDate = new Date(entry.next_maintenance.replace(/-/g, "/"));
          
          // Only include tasks due in the next 6 months
          if (isFuture(nextDate) || format(nextDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
            if (nextDate < sixMonthsFromNow) {
              const monthKey = format(startOfMonth(nextDate), 'yyyy-MM');
              taskCounts[monthKey] = (taskCounts[monthKey] || 0) + 1;
            }
          }
        });
        
        // Generate data points for the next 6 months, even if tasks are zero
        const processedData: ForecastData[] = [];
        for (let i = 0; i < 6; i++) {
          const monthDate = addMonths(startOfMonth(today), i);
          const monthKey = format(monthDate, 'yyyy-MM');
          
          processedData.push({
            month: format(monthDate, 'MMM yyyy'),
            tasks: taskCounts[monthKey] || 0,
          });
        }
          
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
            <CalendarClock className="h-5 w-5 mr-2" /> Maintenance Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-muted-foreground">
            No upcoming maintenance tasks in the next 6 months.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <CalendarClock className="h-5 w-5 mr-2" /> Maintenance Forecast (Next 6 Months)
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
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--foreground))" 
                  fontSize={12} 
                />
                <YAxis 
                  dataKey="tasks" 
                  type="number" 
                  stroke="hsl(var(--foreground))" 
                  fontSize={12} 
                  allowDecimals={false}
                  tickFormatter={(value) => value.toString()}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))', 
                    borderRadius: '0.5rem' 
                  }}
                  labelStyle={{ fontWeight: 'bold', color: 'hsl(var(--foreground))' }}
                  formatter={(value) => [`${value} tasks`, 'Total']}
                />
                <Bar 
                  dataKey="tasks" 
                  name="Tasks"
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MaintenanceForecastChart;