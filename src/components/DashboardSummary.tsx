"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { AlertTriangle, CalendarCheck, Wrench } from "lucide-react";
import { isBefore, isWithinInterval, addDays, startOfDay } from "date-fns";

const DashboardSummary = () => {
  const [stats, setStats] = useState({
    overdue: 0,
    dueSoon: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndCalculateStats = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("maintenance_entries")
        .select("next_maintenance");

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

        data.forEach((entry: { next_maintenance: string }) => {
          const nextMaintenanceDate = startOfDay(
            new Date(entry.next_maintenance.replace(/-/g, "/")),
          );

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
        });

        setStats({
          overdue: overdueCount,
          dueSoon: dueSoonCount,
          total: data.length,
        });
      }
      setLoading(false);
    };

    fetchAndCalculateStats();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
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

  return (
    <div className="grid gap-4 md:grid-cols-3">
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