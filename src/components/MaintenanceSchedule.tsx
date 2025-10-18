"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Clock, Wrench } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format, isPast, isToday, parseISO } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import LowInventoryWidget from './LowInventoryWidget';

// Define types for maintenance entry
interface MaintenanceEntry {
  id: string;
  machine: string;
  last_maintenance: string;
  next_maintenance: string;
  notes: string | null;
  user_id: string;
  created_at: string;
}

// Fetch maintenance entries
const fetchMaintenanceEntries = async (): Promise<MaintenanceEntry[]> => {
  const { data, error } = await supabase
    .from('maintenance_entries')
    .select('*')
    .order('next_maintenance', { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};

const MaintenanceSchedule = () => {
  const { data: entries, isLoading, error } = useQuery<MaintenanceEntry[]>({
    queryKey: ['maintenanceEntries'],
    queryFn: fetchMaintenanceEntries,
  });

  const [upcomingTasks, setUpcomingTasks] = useState<MaintenanceEntry[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<MaintenanceEntry[]>([]);

  useEffect(() => {
    if (entries) {
      const now = new Date();
      const upcoming = entries.filter(entry => {
        const nextDate = parseISO(entry.next_maintenance);
        return !isPast(nextDate) || isToday(nextDate);
      });
      const overdue = entries.filter(entry => {
        const nextDate = parseISO(entry.next_maintenance);
        return isPast(nextDate) && !isToday(nextDate);
      });

      setUpcomingTasks(upcoming);
      setOverdueTasks(overdue);
    }
  }, [entries]);

  const renderTaskItem = (task: MaintenanceEntry, isOverdue: boolean) => (
    <div key={task.id} className="flex justify-between items-center py-3 border-b last:border-b-0">
      <div className="flex items-center">
        {isOverdue ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <AlertTriangle className="h-5 w-5 mr-3 text-red-500 flex-shrink-0" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Overdue since {format(parseISO(task.next_maintenance), 'MMM dd, yyyy')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Clock className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0" />
        )}
        <div>
          <p className="font-medium truncate">{task.machine} Maintenance</p>
          <p className="text-sm text-muted-foreground">
            Next: {format(parseISO(task.next_maintenance), 'MMM dd, yyyy')}
          </p>
        </div>
      </div>
      <Link to={`/maintenance-log?machine=${encodeURIComponent(task.machine)}`}>
        <Button variant="outline" size="sm">View</Button>
      </Link>
    </div>
  );

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        <Skeleton className="h-[300px] col-span-2" />
        <Skeleton className="h-[300px]" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error loading maintenance schedule: {error.message}</div>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
      {/* Upcoming & Overdue Tasks (2/3 width) */}
      <Card className="lg:col-span-2 h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold flex items-center">
            <Wrench className="h-6 w-6 mr-2 text-primary" /> Upcoming & Overdue Tasks
          </CardTitle>
          <Link to="/maintenance-log">
            <Button variant="outline" size="sm">View Log</Button>
          </Link>
        </CardHeader>
        <CardContent className="pt-4">
          {overdueTasks.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-semibold text-red-700 flex items-center mb-2">
                <AlertTriangle className="h-4 w-4 mr-2" /> {overdueTasks.length} Overdue Task{overdueTasks.length !== 1 ? 's' : ''}
              </h3>
              <div className="space-y-1">
                {overdueTasks.map(task => renderTaskItem(task, true))}
              </div>
            </div>
          )}

          {upcomingTasks.length > 0 ? (
            <div className="space-y-1">
              <h3 className="font-semibold text-gray-700 flex items-center mb-2">
                <Clock className="h-4 w-4 mr-2" /> Upcoming Tasks ({upcomingTasks.length})
              </h3>
              {upcomingTasks.map(task => renderTaskItem(task, false))}
            </div>
          ) : (
            <div className="text-center p-8 border rounded-lg bg-gray-50">
              <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-3" />
              <p className="text-lg font-medium">All clear!</p>
              <p className="text-sm text-muted-foreground">No upcoming maintenance tasks scheduled.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Low Inventory Widget (1/3 width) */}
      <LowInventoryWidget />
    </div>
  );
};

export default MaintenanceSchedule;