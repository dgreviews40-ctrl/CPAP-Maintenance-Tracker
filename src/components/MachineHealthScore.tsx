"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, HeartPulse, CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardStats } from "@/hooks/use-dashboard-stats"; // Import the new hook

const MachineHealthScore = () => {
  const { stats, loading } = useDashboardStats();

  if (loading || !stats) {
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
  
  const total = stats.total;
  const overdueCount = stats.overdue;

  let score = 100;
  if (total > 0) {
    // Score = (Total - Overdue) / Total * 100
    score = Math.max(0, Math.round(((total - overdueCount) / total) * 100));
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    return "text-red-500";
  };
  
  const getStatusText = (score: number) => {
    if (total === 0) return "No tasks recorded";
    if (score >= 90) return "Excellent compliance";
    if (score >= 70) return "Good, but needs attention";
    return "Poor compliance, tasks overdue";
  };

  const scoreColor = getScoreColor(score);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <HeartPulse className="h-5 w-5 mr-2" /> Machine Health Score
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center h-64 space-y-4">
        {total === 0 ? (
          <div className="text-center text-muted-foreground">
            <CheckCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Record your first maintenance task to calculate your score.</p>
          </div>
        ) : (
          <>
            <div className={cn("text-7xl font-extrabold", scoreColor)}>
              {score}%
            </div>
            <p className={cn("text-lg font-semibold", scoreColor)}>
              {getStatusText(score)}
            </p>
            <div className="text-sm text-muted-foreground">
              {overdueCount} tasks currently overdue out of {total} total tracked tasks.
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MachineHealthScore;