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
import PartUsageRateChart from "./PartUsageRateChart"; // Import the new chart
import { supabase } from "@/integrations/supabase/client";
import { isBefore, addDays, startOfDay, isWithinInterval, compareAsc, compareDesc } from "date-fns";
import { showSuccess, showError } from "@/utils/toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Warehouse, History } from "lucide-react";
import EditMaintenanceDialog from "./EditMaintenanceDialog"; 

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
  const [machineFilter, setMachineFilter] = useState<string>(""); // New state for machine filter
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
    if (!user) return; // Only fetch if authenticated

    setLoading(true);
    // RLS ensures we only get the user's data
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
  };

  useEffect(() => {
    if (user) {
      fetchEntries();
    } else if (!authLoading) {
      // Clear entries if user logs out
      setEntries([]);
      setLoading(false);
    }
  }, [user, authLoading]);

  const addEntry = async (entry: Omit<MaintenanceEntry, 'id' | 'created_at'>) => {
    if (!user) {
      showError("You must be logged in to add entries.");
      return false;
    }
    
    // Explicitly include user_id for clarity, although RLS insert policy handles it
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
    fetchEntries(); // Re-fetch to update list, dashboard summary, and chart
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
    fetchEntries(); // Re-fetch to update list, dashboard summary, and chart
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
        // Optionally update notes to reflect completion, but keeping existing notes for now
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
    
    // RLS ensures only the owner can delete
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
      // Note: DashboardSummary and InventoryStatusChart will automatically re-fetch data 
      // or rely on the next full fetchEntries call if needed.
    }
  };

  const handleEdit = (entry: MaintenanceEntry) => {
    setEditingEntry(entry);
    setIsEditDialogOpen(true);
  };

  // Memoized filtered and sorted list
  const filteredAndSortedEntries = useMemo(() => {
    let result = entries;

    // 1. Filtering by Status
    if (filter !== "all") {
      result = result.filter(entry => getEntryStatus(entry.next_maintenance) === filter);
    }
    
    // 2. Filtering by Machine Name
    if (machineFilter) {
      // We check if the machine string starts with the machine label, as the string contains part info too.
      result = result.filter(entry => entry.machine.startsWith(machineFilter));
    }

    // 3. Sorting
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
        <CardContent>
          <NotificationPermission onPermissionChange={setNotificationPermission} />
          <DashboardSummary />
          
          {/* Two-Section Dashboard Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            
            {/* Section 1: Inventory Status Chart */}
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

            {/* Section 2: Part Replacement History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <History className="h-5 w-5 mr-2" /> Part Replacement History
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <PartReplacementHistory />
              </CardContent>
            </Card>
          </div>
          
          {/* Maintenance Timeline (Full Width) */}
          <MaintenanceTimeline /> 
          
          {/* Part Usage Rate Chart (Full Width) */}
          <PartUsageRateChart />

          <MaintenanceForm onAddEntry={addEntry} />
          
          <h3 className="text-xl font-semibold mb-4 mt-8">Maintenance Schedule</h3>
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