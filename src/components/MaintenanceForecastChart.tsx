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
import { Loader2, CalendarClock } from "lucide-react";
import { useMaintenanceHistory } from "@/hooks/use-maintenance-history";
import { format, parseISO, isFuture, addDays, startOfDay, isWithinInterval } from "date-fns";

interface ForecastData {
  name: string; // Day name (e.g., 'Today', 'Tomorrow', 'Fri')
  tasks: number; // Number of tasks due that day
}

const MaintenanceForecastChart = () => {
  const { history, loading: loadingHistory } = useMaintenanceHistory();
  const [chartData, setChartData] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loadingHistory) return;

    const allEntries = Object.values(history).flat();
    const today = startOfDay(new Date());
    const sevenDaysFromNow = addDays(today, 6); // Include today + next 6 days (7 total)
    
    // 1. Initialize forecast buckets for the next 7 days
    const forecastMap = new Map<string, number>();
    const dayLabels: string[] = [];
    
    for (let i = 0; i < 7; i++) {
      const date = addDays(today, i);
      let label = format(date, 'EEE'); // Short day name (e.g., Fri)
      if (i === 0) label = 'Today';
      if (i === 1) label = 'Tomorrow';
      
      const key = format(date, 'yyyy-MM-dd');
      forecastMap.set(key, 0);
      dayLabels.push(key);
    }
    
    // 2. Populate buckets with maintenance tasks
    allEntries.forEach(entry => {
      if (!entry.next_maintenance) return; // Skip if date is missing

      const nextMaintenanceDate = parseISO(entry.next_maintenance);
      
      if (isNaN(nextMaintenanceDate.getTime())) return; // Skip if date is invalid
      
      // Check if the task is due today or in the next 6 days
      if (isFuture(nextMaintenanceDate) || format(nextMaintenanceDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
        if (isWithinInterval(nextMaintenanceDate, { start: today, end: sevenDaysFromNow })) {
          const dayKey = format(startOfDay(nextMaintenanceDate), 'yyyy-MM-dd');
          
          if (forecastMap.has(dayKey)) {
            forecastMap.set(dayKey, forecastMap.get(dayKey)! + 1);
          }
        }
      }
    });

    // 3. Convert map to array for Recharts, ensuring correct order and labels
    const data: ForecastData[] = dayLabels
      .map((key, index) => {
        const date = addDays(today, index);
        let label = format(date, 'EEE');
        if (index === 0) label = 'Today';
        if (index === 1) label = 'Tomorrow';
        
        return {
          name: label,
          tasks: forecastMap.get(key) || 0,
        };
      });

    setChartData(data);
    setLoading(false);
  }, [history, loadingHistory]);

  if (loading) {
    return (
      <Card className="w-full mt-6">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <CalendarClock className="h-5 w-5 mr-2" /> Maintenance Forecast (Next 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  const totalTasks = chartData.reduce((sum, item) => sum + item.tasks, 0);

  if (totalTasks === 0) {
    return (
      <Card className="w-full mt-6">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <CalendarClock className="h-5 w-5 mr-2" /> Maintenance Forecast (Next 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-muted-foreground">
            No maintenance tasks scheduled in the next 7 days.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <CalendarClock className="h-5 w-5 mr-2" /> Maintenance Forecast (Next 7 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
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
                label={{ value: 'Tasks Due', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))', 
                  borderRadius: '0.5rem' 
                }}
                labelStyle={{ fontWeight: 'bold', color: 'hsl(var(--foreground))' }}
                formatter={(value, name) => [`${value} tasks`, 'Total']}
              />
              <Bar 
                dataKey="tasks" 
                name="Tasks Due"
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MaintenanceForecastChart;