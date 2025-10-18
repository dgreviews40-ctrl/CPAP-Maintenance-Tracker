"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
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
import MaintenanceControls, { MaintenanceFilter, MaintenanceSortKey, MaintenanceSortOrder } from "./MaintenanceControls";
import InventoryStatusChart from "./InventoryStatusChart"; 
import PartReplacementHistory from "./PartReplacementHistory";
import MaintenanceTimeline from "./MaintenanceTimeline"; 
import PartUsageRateChart from "./PartUsageRateChart";
import GettingStarted from "./GettingStarted";
import { supabase } from "@/integrations/supabase/client";
import { isBefore, addDays, startOfDay, isWithinInterval, compareAsc, compareDesc } from "date-fns";
import { showSuccess, showError } from "@/utils/toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Warehouse, History } from "lucide-react";
import EditMaintenanceDialog from "./EditMaintenanceDialog"; 
import { useSeedData } from "@/hooks/use-seed-data"; // Import the new hook

export type MaintenanceEntry = {
  id: string;
  machine: string;
  last_maintenance: string;
  next_maintenance: string;
  notes?: string;
  created_at: string;
};

// Helper function to determine the status of an entry
const getEntryStatus = (dateStr: string): MaintenanceFilter => {
  const today = startOfDay(new Date());
  const nextMaintenanceDate = startOfDay(
    new Date(dateStr.replace(/-/g, "/")),
  );

  if (isBefore(nextMaintenanceDate, today)) {
    return "overdue";
  }

  const sevenDaysFromNow = addDays(today, 7);
  if (
    isWithinInterval(nextMaintenanceDate, {
      start: today,
      end: sevenDaysFromNow,
    })
  ) {
    return "due_soon";
  }

  return "on_schedule";
};


const MaintenanceTracker = () => {
  const { user, loading: authLoading } = useAuth();
  const [entries, setEntries] = useState<MaintenanceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  
  // State for Controls
  const [filter, setFilter] = useState<MaintenanceFilter>("all");
  const [machineFilter, setMachineFilter] = useState<string>("");
  const [sortKey, setSortKey] = useState<MaintenanceSortKey>("next_maintenance");
  const [sortOrder, setSortOrder] = useState<MaintenanceSortOrder>("asc");

  // State for Editing
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<MaintenanceEntry | null>(null);


  const checkAndNotify = useCallback((data: MaintenanceEntry[]) => {
    if (notificationPermission !== 'granted') return;

    const today = startOfDay(new Date());
    const sevenDaysFromNow = addDays(today, 7);
    
    let overdueCount = 0;
    let dueSoonCount = 0;

    data.forEach((entry) => {
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

  const fetchEntries = useCallback(async () => {
    if (!user) return;

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
      setEntries(fetchedEntries as MaintenanceEntry[]);
      checkAndNotify(fetchedEntries as MaintenanceEntry[]);
    }
    setLoading(false);
  }, [user]);

  // Use the new seed data hook, passing fetchEntries as the callback
  useSeedData(fetchEntries);

  useEffect(() => {
    if (user) {
      fetchEntries();
    } else if (!authLoading) {
      setEntries([]);
      setLoading(false);
    }
  }, [user, authLoading, fetchEntries]);

  const addEntry = async (entry: Omit<MaintenanceEntry, 'id' | 'created_at'>) => {
    if (!user) {
      showError("You must be logged in to add entries.");
      return false;
    }
    
    const entryWithUserId = { ...entry, user_id: user.id };

    const { error } = await supabase
      .from("maintenance_entries")
      .insert([entryWithUserId]);

    if (error) {
      console.error("Error adding entry:", error);
      showError("Failed to add maintenance entry.");
      return false;
    }
    
    showSuccess("Maintenance entry added successfully!");
    fetchEntries();
    return true;
  };

  const updateEntry = async (id: string, entry: Omit<MaintenanceEntry, 'id' | 'created_at'>) => {
    if (!user) {
      showError("You must be logged in to update entries.");
      return false;
    }

    const { error } = await supabase
      .from("maintenance_entries")
      .update(entry)
      .eq("id", id);

    if (error) {
      console.error("Error updating entry:", error);
      showError("Failed to update maintenance entry.");
      return false;
    }

    showSuccess("Maintenance entry updated successfully!");
    fetchEntries();
    return true;
  };
  
  const completeMaintenance = async (id: string, newLastDate: string, newNextDate: string): Promise<boolean> => {
    if (!user) {
      showError("You must be logged in to complete maintenance.");
      return false;
    }
    
    const { error } = await supabase
      .from("maintenance_entries")
      .update({
        last_maintenance: newLastDate,
        next_maintenance: newNextDate,
      })
      .eq("id", id);

    if (error) {
      console.error("Error completing maintenance:", error);
      showError("Failed to mark maintenance as complete.");
      return false;
    }

    showSuccess("Maintenance marked as complete! Next due date recalculated.");
    fetchEntries();
    return true;
  };

  const deleteEntry = async (id: string) => {
    if (!user) {
      showError("You must be logged in to delete entries.");
      return;
    }
    
    const { error } = await supabase
      .from("maintenance_entries")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting entry:", error);
      showError("Failed to delete maintenance entry.");
    } else {
      showSuccess("Entry deleted.");
      fetchEntries();
    }
  };

  const handleEdit = (entry: MaintenanceEntry) => {
    setEditingEntry(entry);
    setIsEditDialogOpen(true);
  };

  const filteredAndSortedEntries = useMemo(() => {
    let result = entries;

    if (filter !== "all") {
      result = result.filter(entry => getEntryStatus(entry.next_maintenance) === filter);
    }
    
    if (machineFilter) {
      result = result.filter(entry => entry.machine.startsWith(machineFilter));
    }

    result.sort((a, b) => {
      if (sortKey === "next_maintenance") {
        const dateA = new Date(a.next_maintenance.replace(/-/g, "/"));
        const dateB = new Date(b.next_maintenance.replace(/-/g, "/"));
        return sortOrder === "asc" ? compareAsc(dateA, dateB) : compareDesc(dateA, dateB);
      }
      
      if (sortKey === "machine") {
        const machineA = a.machine.toLowerCase();
        const machineB = b.machine.toLowerCase();
        if (machineA < machineB) return sortOrder === "asc" ? -1 : 1;
        if (machineA > machineB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      }
      
      return 0;
    });

    return result;
  }, [entries, filter, machineFilter, sortKey, sortOrder]);

  if (authLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Maintenance Tracker</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <NotificationPermission onPermissionChange={setNotificationPermission} />
          
          <DashboardSummary key={`summary-${entries.length}`} />
          
          {!loading && entries.length === 0 && <GettingStarted />}

          <div key={`charts-${entries.length}`}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Warehouse className="h-5 w-5 mr-2" /> Inventory Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <InventoryStatusChart />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <History className="h-5 w-5 mr-2" /> Recent Replacements
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <PartReplacementHistory />
                </CardContent>
              </Card>
            </div>
            
            <MaintenanceTimeline /> 
            <PartUsageRateChart />
          </div>

          <div className="pt-4">
            <h3 className="text-xl font-semibold mb-4">Add New Maintenance Entry</h3>
            <MaintenanceForm onAddEntry={addEntry} />
          </div>
          
          <div className="pt-4">
            <h3 className="text-xl font-semibold mb-4">Maintenance Schedule</h3>
            <MaintenanceControls 
              filter={filter}
              onFilterChange={setFilter}
              machineFilter={machineFilter}
              onMachineFilterChange={setMachineFilter}
              sortKey={sortKey}
              onSortKeyChange={setSortKey}
              sortOrder={sortOrder}
              onSortOrderChange={setSortOrder}
            />
            
            <MaintenanceList 
              entries={filteredAndSortedEntries} 
              onDeleteEntry={deleteEntry} 
              onEditEntry={handleEdit} 
              onCompleteMaintenance={completeMaintenance}
              loading={loading} 
            />
          </div>
        </CardContent>
      </Card>

      {editingEntry && (
        <EditMaintenanceDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          entry={editingEntry}
          onUpdate={updateEntry}
        />
      )}
    </>
  );
};

export default MaintenanceTracker;