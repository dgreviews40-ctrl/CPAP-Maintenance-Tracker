"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, HeartPulse, CheckCircle, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { isBefore, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";

interface HealthStats {
  score: number;
  total: number;
  overdue: number;
}

const MachineHealthScore = () => {
  const [stats, setStats] = useState<HealthStats>({
    score: 100,
    total: 0,
    overdue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndCalculateScore = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("maintenance_entries")
        .select("next_maintenance");

      if (error) {
        console.error("Error fetching maintenance entries for health score:", error);
        setLoading(false);
        return;
      }

      if (data) {
        const total = data.length;
        const today = startOfDay(new Date());
        let overdueCount = 0;

        data.forEach((entry: { next_maintenance: string }) => {
          if (!entry.next_maintenance) return;

          // Handle timezone issues by replacing hyphens with slashes
          const nextMaintenanceDate = startOfDay(
            new Date(entry.next_maintenance.replace(/-/g, "/")),
          );
          
          if (isNaN(nextMaintenanceDate.getTime())) return;

          if (isBefore(nextMaintenanceDate, today)) {
            overdueCount++;
          }
        });
        
        let score = 100;
        if (total > 0) {
          // Score = (Total - Overdue) / Total * 100
          score = Math.max(0, Math.round(((total - overdueCount) / total) * 100));
        }

        setStats({
          score,
          total,
          overdue: overdueCount,
        });
      }
      setLoading(false);
    };

    fetchAndCalculateScore();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    return "text-red-500";
  };
  
  const getStatusText = (score: number) => {
    if (stats.total === 0) return "No tasks recorded";
    if (score >= 90) return "Excellent compliance";
    if (score >= 70) return "Good, but needs attention";
    return "Poor compliance, tasks overdue";
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <HeartPulse className="h-5 w-5 mr-2" /> Machine Health Score
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  const scoreColor = getScoreColor(stats.score);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <HeartPulse className="h-5 w-5 mr-2" /> Machine Health Score
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center h-64 space-y-4">
        {stats.total === 0 ? (
          <div className="text-center text-muted-foreground">
            <CheckCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Record your first maintenance task to calculate your score.</p>
          </div>
        ) : (
          <>
            <div className={cn("text-7xl font-extrabold", scoreColor)}>
              {stats.score}%
            </div>
            <p className={cn("text-lg font-semibold", scoreColor)}>
              {getStatusText(stats.score)}
            </p>
            <div className="text-sm text-muted-foreground">
              {stats.overdue} tasks currently overdue out of {stats.total} total tracked tasks.
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MachineHealthScore;