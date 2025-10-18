"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { List, Wrench, CalendarWarning } from "lucide-react";
import { format, isBefore, isWithinInterval, addDays, startOfDay, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface UpcomingTask {
  id: string;
  machine: string;
  next_maintenance: string;
  status: 'overdue' | 'due_soon' | 'on_schedule';
}

const getStatus = (dateStr: string): UpcomingTask['status'] => {
  const today = startOfDay(new Date());
  const nextDate = startOfDay(new Date(dateStr.replace(/-/g, "/")));
  
  if (isBefore(nextDate, today)) return 'overdue';
  if (isWithinInterval(nextDate, { start: today, end: addDays(today, 7) })) return 'due_soon';
  return 'on_schedule';
};

const UpcomingTasks = () => {
  const [tasks, setTasks] = useState<UpcomingTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("maintenance_entries")
        .select("id, machine, next_maintenance")
        .order("next_maintenance", { ascending: true })
        .limit(5);

      if (error) {
        console.error("Error fetching upcoming tasks:", error);
      } else if (data) {
        const processedTasks = data.map(item => ({
          ...item,
          status: getStatus(item.next_maintenance),
        }));
        setTasks(processedTasks);
      }
      setLoading(false);
    };

    fetchTasks();
  }, []);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <List className="h-5 w-5 mr-2" /> Upcoming & Overdue Tasks
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Wrench className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center text-muted-foreground py-10">
            <CalendarWarning className="h-8 w-8 mx-auto mb-2" />
            <p>No upcoming maintenance tasks found.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {tasks.map(task => {
              const nextDate = new Date(task.next_maintenance.replace(/-/g, "/"));
              const daysAway = differenceInDays(startOfDay(nextDate), startOfDay(new Date()));
              
              return (
                <li key={task.id} className="flex items-center justify-between">
                  <div className="flex-1 truncate pr-4">
                    <p className="font-medium truncate">{task.machine}</p>
                    <p className="text-sm text-muted-foreground">
                      Due: {format(nextDate, "MMM dd, yyyy")}
                    </p>
                  </div>
                  <Badge 
                    variant={task.status === 'overdue' ? 'destructive' : task.status === 'due_soon' ? 'secondary' : 'default'}
                    className={cn(task.status === 'due_soon' && "border border-yellow-500 text-yellow-700 dark:text-yellow-400")}
                  >
                    {task.status === 'overdue' ? `Overdue by ${Math.abs(daysAway)}d` : `${daysAway}d away`}
                  </Badge>
                </li>
              );
            })}
             <li className="pt-2 border-t">
                <Link to="/#tracker" className="text-sm text-primary hover:underline">
                    View all tasks...
                </Link>
            </li>
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingTasks;