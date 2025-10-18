"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, CalendarCheck, Wrench, Clock } from "lucide-react";
import { isBefore, isWithinInterval, addDays, startOfDay, format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { parseMaintenanceMachineString, generateUniqueKey } from "@/utils/parts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Stats {
  overdue: number;
  dueSoon: number;
  total: number;
  nextDue: {
    machine: string;
    date: string;
    daysAway: number;
    uniqueKey: string; // Added uniqueKey
  } | null;
}

const DashboardSummary = () => {
  const [stats, setStats] = useState<Stats>({
    overdue: 0,
    dueSoon: 0,
    total: 0,
    nextDue: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndCalculateStats = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("maintenance_entries")
        .select("machine, next_maintenance")
        .order("next_maintenance", { ascending: true }); // Order by date to easily find the next due item

      if (error) {
        console.error("Error fetching maintenance entries for stats:", error);
        setLoading(false);
        return;
      }

      if (data) {
        const today = startOfDay(new Date());
        const sevenDaysFromNow = addDays(today, 7);

        let overdueCount = 0;
        let dueSoonCount = 0;
        let nextDueItem: Stats['nextDue'] = null;

        data.forEach((entry: { machine: string, next_maintenance: string }) => {
          if (!entry.next_maintenance) return; // Skip if date is missing

          // Handle timezone issues by replacing hyphens with slashes
          const nextMaintenanceDate = startOfDay(
            new Date(entry.next_maintenance.replace(/-/g, "/")),
          );
          
          if (isNaN(nextMaintenanceDate.getTime())) return; // Skip if date is invalid

          if (isBefore(nextMaintenanceDate, today)) {
            overdueCount++;
          } else if (
            isWithinInterval(nextMaintenanceDate, {
              start: today,
              end: sevenDaysFromNow,
            })
          ) {
            dueSoonCount++;
          }
          
          // Find the very next item that is not overdue
          if (!nextDueItem && !isBefore(nextMaintenanceDate, today)) {
            const daysAway = differenceInDays(nextMaintenanceDate, today);
            const { machineLabel, partTypeLabel, modelLabel } = parseMaintenanceMachineString(entry.machine);
            
            nextDueItem = {
              machine: entry.machine,
              date: format(nextMaintenanceDate, 'MMM dd, yyyy'),
              daysAway: daysAway,
              uniqueKey: generateUniqueKey(machineLabel, partTypeLabel, modelLabel),
            };
          }
        });

        setStats({
          overdue: overdueCount,
          dueSoon: dueSoonCount,
          total: data.length,
          nextDue: nextDueItem,
        });
      }
      setLoading(false);
    };

    fetchAndCalculateStats();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-12 bg-muted rounded animate-pulse"></div>
              <div className="h-3 w-32 bg-muted rounded animate-pulse mt-2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const nextDuePartName = stats.nextDue?.machine.split(' - ')[2]?.trim() || stats.nextDue?.machine;
  const nextDueMachineName = stats.nextDue?.machine.split(' - ')[0]?.trim() || '';

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {/* Next Due Card */}
      <Card className={cn(
        stats.nextDue && stats.nextDue.daysAway <= 7 && stats.nextDue.daysAway >= 0 ? "border-yellow-500" : ""
      )}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Next Maintenance</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {stats.nextDue ? (
            <>
              <Link 
                to={`/part/${encodeURIComponent(stats.nextDue.uniqueKey)}`}
                className="text-xl font-bold truncate hover:underline block" // Added 'block' to ensure truncate works
                title={stats.nextDue.machine}
              >
                {nextDuePartName}
              </Link>
              <p className="text-xs text-muted-foreground mt-1 truncate" title={nextDueMachineName}>
                {nextDueMachineName} | {stats.nextDue.date} ({stats.nextDue.daysAway} days)
              </p>
            </>
          ) : (
            <>
              <div className="text-xl font-bold">N/A</div>
              <p className="text-xs text-muted-foreground mt-1">No upcoming tasks</p>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Total Entries Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
          <Wrench className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            Total maintenance records
          </p>
        </CardContent>
      </Card>
      
      {/* Due Soon Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
          <CalendarCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.dueSoon}</div>
          <p className="text-xs text-muted-foreground">
            Tasks due within 7 days
          </p>
        </CardContent>
      </Card>
      
      {/* Overdue Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">{stats.overdue}</div>
          <p className="text-xs text-muted-foreground">
            Maintenance tasks are overdue
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSummary;