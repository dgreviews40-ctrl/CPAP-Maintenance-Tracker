"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Clock, CalendarCheck, AlertTriangle } from "lucide-react";
import { useMaintenanceHistory, MaintenanceEntry } from "@/hooks/use-maintenance-history";
import { format, parseISO, differenceInDays, startOfDay, isBefore } from "date-fns";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { parseMaintenanceMachineString, generateUniqueKey } from "@/utils/parts";

interface TimelineTask {
  id: string;
  machine: string;
  next_maintenance: string;
  daysAway: number;
  status: 'overdue' | 'due_soon' | 'on_schedule';
  uniqueKey: string;
}

const getStatus = (dateStr: string, daysAway: number): TimelineTask['status'] => {
  if (isBefore(startOfDay(parseISO(dateStr.replace(/-/g, "/"))), startOfDay(new Date()))) return 'overdue';
  if (daysAway <= 7) return 'due_soon';
  return 'on_schedule';
};

const MaintenanceTimelineChart = () => {
  const { history, loading: loadingHistory } = useMaintenanceHistory();

  const timelineTasks = useMemo(() => {
    if (loadingHistory) return [];

    const allEntries = Object.values(history).flat();
    const today = startOfDay(new Date());

    const tasks: TimelineTask[] = allEntries
      .filter(entry => entry.next_maintenance)
      .map(entry => {
        const nextDate = startOfDay(parseISO(entry.next_maintenance.replace(/-/g, "/")));
        const daysAway = differenceInDays(nextDate, today);
        const { machineLabel, partTypeLabel, modelLabel } = parseMaintenanceMachineString(entry.machine);
        
        return {
          id: entry.id,
          machine: entry.machine,
          next_maintenance: entry.next_maintenance,
          daysAway: daysAway,
          status: getStatus(entry.next_maintenance, daysAway),
          uniqueKey: generateUniqueKey(machineLabel, partTypeLabel, modelLabel),
        };
      })
      .sort((a, b) => a.daysAway - b.daysAway) // Sort by closest date first
      .slice(0, 10); // Show next 10 tasks

    return tasks;
  }, [history, loadingHistory]);

  if (loadingHistory) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Clock className="h-5 w-5 mr-2" /> Machine Maintenance Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (timelineTasks.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Clock className="h-5 w-5 mr-2" /> Machine Maintenance Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-muted-foreground">
            No upcoming maintenance tasks found.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Clock className="h-5 w-5 mr-2" /> Next 10 Maintenance Tasks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative border-l border-muted-foreground/50 ml-2 space-y-4">
          {timelineTasks.map((task, index) => {
            const isOverdue = task.status === 'overdue';
            const isDueSoon = task.status === 'due_soon';
            
            let icon = <CalendarCheck className="h-3 w-3 text-primary-foreground" />;
            let ringColor = "ring-primary";
            let dotColor = "bg-primary";
            let textColor = "text-foreground";

            if (isOverdue) {
              icon = <AlertTriangle className="h-3 w-3 text-white" />;
              ringColor = "ring-red-500/50";
              dotColor = "bg-red-500";
              textColor = "text-red-500";
            } else if (isDueSoon) {
              icon = <AlertTriangle className="h-3 w-3 text-primary-foreground" />;
              ringColor = "ring-yellow-500/50";
              dotColor = "bg-yellow-500";
            }

            const partName = task.machine.split(' - ')[2]?.trim() || task.machine;
            const machineName = task.machine.split(' - ')[0]?.trim() || '';

            return (
              <li key={task.id} className="ml-6">
                <span className={cn(
                  "absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ring-4",
                  ringColor,
                  dotColor
                )}>
                  {icon}
                </span>
                <Link 
                  to={`/part/${encodeURIComponent(task.uniqueKey)}`}
                  className="font-semibold text-base hover:underline"
                >
                  {partName}
                </Link>
                <p className="text-sm text-muted-foreground mb-1">
                  {machineName}
                </p>
                <time className={cn("block text-sm font-normal leading-none", textColor)}>
                  {isOverdue 
                    ? `Overdue by ${Math.abs(task.daysAway)} days`
                    : `Due in ${task.daysAway} days (${format(parseISO(task.next_maintenance), "MMM dd, yyyy")})`}
                </time>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
};

export default MaintenanceTimelineChart;