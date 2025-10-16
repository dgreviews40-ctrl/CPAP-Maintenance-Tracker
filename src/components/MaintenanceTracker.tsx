"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import MaintenanceList from "./MaintenanceList";
import MaintenanceForm from "./MaintenanceForm";
import DashboardSummary from "./DashboardSummary";
import NotificationPermission from "./NotificationPermission";
import { supabase } from "@/lib/supabase";
import { isBefore, addDays, startOfDay } from "date-fns";
import { showSuccess, showError } from "@/utils/toast";

export type MaintenanceEntry = {
  id: string;
  machine: string;
  last_maintenance: string;
  next_maintenance: string;
  notes?: string;
  created_at: string;
};

const MaintenanceTracker = () => {
  const [entries, setEntries] = useState<MaintenanceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  const checkAndNotify = useCallback((data: MaintenanceEntry[]) => {
    if (notificationPermission !== 'granted') return;

    const today = startOfDay(new Date());
    const sevenDaysFromNow = addDays(today, 7);
    
    let overdueCount = 0;
    let dueSoonCount = 0;

    data.forEach((entry) => {
      // Handle timezone issues by replacing hyphens with slashes
      const nextMaintenanceDate = startOfDay(
        new Date(entry.next_maintenance.replace(/-/g, "/")),
      );

      if (isBefore(nextMaintenanceDate, today)) {
        overdueCount++;
      } else if (
        isBefore(nextMaintenanceDate, sevenDaysFromNow)
      ) {
        dueSoonCount++;
      }
    });

    if (overdueCount > 0) {
      new Notification("🚨 Maintenance Overdue!", {
        body: `You have ${overdueCount} item(s) that are past their maintenance date.`,
        icon: "/favicon.ico",
      });
    } else if (dueSoonCount > 0) {
      new Notification("⚠️ Maintenance Due Soon", {
        body: `You have ${dueSoonCount} item(s) due for maintenance in the next 7 days.`,
        icon: "/favicon.ico",
      });
    }
  }, [notificationPermission]);

  const fetchEntries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("maintenance_entries")
      .select("*")
      .order("next_maintenance", { ascending: true });

    if (error) {
      console.error("Error fetching entries:", error);
      showError("Failed to load maintenance entries.");
      setEntries([]);
    } else {
      const fetchedEntries = data || [];
      setEntries(fetchedEntries);
      checkAndNotify(fetchedEntries as MaintenanceEntry[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const addEntry = async (entry: Omit<MaintenanceEntry, 'id' | 'created_at'>) => {
    const { error } = await supabase
      .from("maintenance_entries")
      .insert([entry]);

    if (error) {
      console.error("Error adding entry:", error);
      showError("Failed to add maintenance entry.");
      return false;
    }
    
    showSuccess("Maintenance entry added successfully!");
    fetchEntries();
    return true;
  };

  const deleteEntry = async (id: string) => {
    const { error } = await supabase
      .from("maintenance_entries")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting entry:", error);
      showError("Failed to delete maintenance entry.");
    } else {
      showSuccess("Entry deleted.");
      setEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Maintenance Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        <NotificationPermission onPermissionChange={setNotificationPermission} />
        <DashboardSummary />
        <MaintenanceForm onAddEntry={addEntry} />
        <MaintenanceList entries={entries} onDeleteEntry={deleteEntry} loading={loading} />
      </CardContent>
    </Card>
  );
};

export default MaintenanceTracker;