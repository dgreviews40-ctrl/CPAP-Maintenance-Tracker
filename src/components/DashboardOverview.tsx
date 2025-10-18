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
import DashboardSummary from './DashboardSummary';
import InventoryAlert from './InventoryAlert';
import MaintenanceForecastChart from './MaintenanceForecastChart';
import PartUsageRateChart from './PartUsageRateChart';
import MaintenanceActivityChart from './MaintenanceActivityChart';
import PartTypeBreakdownChart from './PartTypeBreakdownChart';
import MachineHealthScore from './MachineHealthScore';
import UpcomingTasks from './UpcomingTasks'; // Use the smaller UpcomingTasks widget

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

// Fetch maintenance entries (used to determine if we need to show GettingStarted)
const fetchMaintenanceEntries = async (): Promise<MaintenanceEntry[]> => {
  const { data, error } = await supabase
    .from('maintenance_entries')
    .select('*', { count: 'exact', head: true });

  if (error) throw new Error(error.message);
  return data;
};

const DashboardOverview = () => {
  // We use a head query just to check if any entries exist
  const { data: entries, isLoading: loadingEntries } = useQuery<MaintenanceEntry[]>({
    queryKey: ['maintenanceEntriesCount'],
    queryFn: fetchMaintenanceEntries,
    staleTime: 1000 * 10,
  });
  
  // Determine if we should show the Getting Started component (if no entries exist)
  const showGettingStarted = !loadingEntries && entries?.length === 0;
  
  // Note: The actual task list logic is now handled by UpcomingTasks, 
  // but we keep the structure for the main dashboard view.

  if (loadingEntries) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-24 col-span-4" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-64 col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <InventoryAlert />
      
      <DashboardSummary />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2/3 width) - Charts */}
        <div className="lg:col-span-2 space-y-6">
          <MaintenanceActivityChart />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MaintenanceForecastChart />
            <PartTypeBreakdownChart />
          </div>
          <PartUsageRateChart />
        </div>

        {/* Right Column (1/3 width) - Widgets */}
        <div className="lg:col-span-1 space-y-6">
          <UpcomingTasks />
          <MachineHealthScore />
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;