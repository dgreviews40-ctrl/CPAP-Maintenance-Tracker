"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useUser } from "@/hooks/use-user";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import MaintenanceForm from "./MaintenanceForm";
import MaintenanceList from "./MaintenanceList";
import EditMaintenanceDialog from "./EditMaintenanceDialog";
import GettingStarted from "./GettingStarted";
import { showSuccess, showError } from "@/utils/toast";
import { isBefore, isWithinInterval, addDays, startOfDay, format, subDays } from "date-fns";
import MaintenanceControls, { MaintenanceFilter, MaintenanceSortKey, MaintenanceSortOrder } from "./MaintenanceControls";
import { useDataRefresh } from "@/contexts/DataRefreshContext";
import { useMaintenanceHistory } from "@/hooks/use-maintenance-history";

// Define MaintenanceEntry here for local use and export for other components
export interface MaintenanceEntry {
  id: string;
  machine: string;
  last_maintenance: string;
  next_maintenance: string;
  notes?: string;
  created_at: string;
}

const MaintenanceTracker = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const { refreshData } = useDataRefresh();
  const { history, loading: loadingHistory } = useMaintenanceHistory();
  
  const [isSeeding, setIsSeeding] = useState(false);
  const [entries, setEntries] = useState<MaintenanceEntry[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<MaintenanceEntry | null>(null);

  // Filtering and Sorting State
  const [filter, setFilter] = useState<MaintenanceFilter>("all");
  const [sortKey, setSortKey] = useState<MaintenanceSortKey>("next_maintenance");
  const [sortOrder, setSortOrder] = useState<MaintenanceSortOrder>("asc");
  const [machineFilter, setMachineFilter] = useState<string>("");

  // Flatten history map into a list of entries
  useEffect(() => {
    if (!loadingHistory) {
      const allEntries = Object.values(history).flat();
      setEntries(allEntries);
    }
  }, [history, loadingHistory]);

  // --- CRUD Operations ---

  const handleAddEntry = useCallback(async (newEntry: Omit<MaintenanceEntry, 'id' | 'created_at'>): Promise<boolean> => {
    if (!user) {
      showError("You must be logged in to add entries.");
      return false;
    }

    const { error } = await supabase
      .from("maintenance_entries")
      .insert([{ ...newEntry, user_id: user.id }]);

    if (error) {
      console.error("Error adding maintenance entry:", error);
      showError("Failed to add maintenance entry.");
      return false;
    }

    showSuccess("Maintenance entry added successfully!");
    refreshData(); // Trigger data refresh across the app
    return true;
  }, [user, refreshData]);

  const handleUpdateEntry = useCallback(async (id: string, updatedEntry: Omit<MaintenanceEntry, 'id' | 'created_at'>): Promise<boolean> => {
    const { error } = await supabase
      .from("maintenance_entries")
      .update(updatedEntry)
      .eq("id", id);

    if (error) {
      console.error("Error updating maintenance entry:", error);
      showError("Failed to update maintenance entry.");
      return false;
    }

    showSuccess("Maintenance entry updated successfully!");
    refreshData();
    return true;
  }, [refreshData]);

  const handleDeleteEntry = useCallback(async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this maintenance entry?")) return;

    const { error } = await supabase
      .from("maintenance_entries")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting maintenance entry:", error);
      showError("Failed to delete maintenance entry.");
    } else {
      showSuccess("Maintenance entry deleted.");
      refreshData();
    }
  }, [refreshData]);
  
  const handleCompleteMaintenance = useCallback(async (id: string, newLastDate: string, newNextDate: string): Promise<boolean> => {
    const { error } = await supabase
      .from("maintenance_entries")
      .update({ 
        last_maintenance: newLastDate, 
        next_maintenance: newNextDate 
      })
      .eq("id", id);

    if (error) {
      console.error("Error completing maintenance:", error);
      showError("Failed to mark maintenance as done.");
      return false;
    }

    showSuccess("Maintenance completed and next due date calculated!");
    refreshData();
    return true;
  }, [refreshData]);

  // --- Filtering and Sorting Logic ---

  const filteredAndSortedEntries = useMemo(() => {
    const today = startOfDay(new Date());
    const sevenDaysFromNow = addDays(today, 7);

    let filtered = entries;

    // 1. Filter by Machine
    if (machineFilter) {
      filtered = filtered.filter(entry => entry.machine.includes(machineFilter));
    }

    // 2. Filter by Status
    filtered = filtered.filter(entry => {
      // Handle timezone issues by replacing hyphens with slashes
      const nextMaintenanceDate = startOfDay(
        new Date(entry.next_maintenance.replace(/-/g, "/")),
      );

      const isOverdue = isBefore(nextMaintenanceDate, today);
      const isDueSoon = isWithinInterval(nextMaintenanceDate, {
        start: today,
        end: sevenDaysFromNow,
      });

      switch (filter) {
        case "overdue":
          return isOverdue;
        case "due_soon":
          return !isOverdue && isDueSoon;
        case "on_schedule":
          return !isOverdue && !isDueSoon;
        case "all":
        default:
          return true;
      }
    });

    // 3. Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortKey === "next_maintenance") {
        const dateA = new Date(a.next_maintenance.replace(/-/g, "/")).getTime();
        const dateB = new Date(b.next_maintenance.replace(/-/g, "/")).getTime();
        comparison = dateA - dateB;
      } else if (sortKey === "machine") {
        comparison = a.machine.localeCompare(b.machine);
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [entries, filter, sortKey, sortOrder, machineFilter]);

  // --- Sample Data Seeding ---

  const handleSeedData = async () => {
    if (!user) return;
    setIsSeeding(true);

    const seedEntries: Omit<MaintenanceEntry, 'id' | 'created_at'>[] = [
      {
        machine: "ResMed AirSense 11 - Filter - Standard Filter (30-day) (SKU: ResMed SKU 37301)",
        last_maintenance: format(subDays(new Date(), 45), 'yyyy-MM-dd'),
        next_maintenance: format(subDays(new Date(), 15), 'yyyy-MM-dd'), // Overdue
        notes: "Sample overdue filter change.",
      },
      {
        machine: "Philips Respironics DreamStation 2 - Tubing - Heated Tubing (SKU: Philips SKU 1122184)",
        last_maintenance: format(subDays(new Date(), 80), 'yyyy-MM-dd'),
        next_maintenance: format(addDays(new Date(), 10), 'yyyy-MM-dd'), // Due soon
        notes: "Sample tubing change due soon.",
      },
      {
        machine: "ResMed AirSense 10 - Mask - AirFit F20 Full Face Mask (SKU: ResMed SKU 63400)",
        last_maintenance: format(subDays(new Date(), 10), 'yyyy-MM-dd'),
        next_maintenance: format(addDays(new Date(), 20), 'yyyy-MM-dd'), // On schedule
        notes: "Sample mask change on schedule.",
      },
    ];

    const entriesWithUserId = seedEntries.map(entry => ({ ...entry, user_id: user.id }));

    const { error } = await supabase
      .from("maintenance_entries")
      .insert(entriesWithUserId);

    if (error) {
      console.error("Error seeding data:", error);
      showError("Failed to load sample data.");
    } else {
      showSuccess("Sample data loaded successfully!");
      refreshData();
    }
    setIsSeeding(false);
  };

  const showGettingStarted = !loadingHistory && entries.length === 0;

  return (
    <Card className="p-6">
      <CardHeader className="p-0 mb-6">
        <CardTitle className="text-2xl">Maintenance Tracker</CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-6">
        
        {showGettingStarted && (
          <GettingStarted onSeedClick={handleSeedData} isSeeding={isSeeding} />
        )}

        <MaintenanceForm onAddEntry={handleAddEntry} />

        <MaintenanceControls
          filter={filter}
          onFilterChange={setFilter}
          sortKey={sortKey}
          onSortKeyChange={setSortKey}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          machineFilter={machineFilter}
          onMachineFilterChange={setMachineFilter}
        />

        <MaintenanceList
          entries={filteredAndSortedEntries}
          onDeleteEntry={handleDeleteEntry}
          onEditEntry={(entry) => {
            setSelectedEntry(entry);
            setIsEditing(true);
          }}
          onCompleteMaintenance={handleCompleteMaintenance}
          loading={loadingHistory}
        />

        {selectedEntry && (
          <EditMaintenanceDialog
            open={isEditing}
            onOpenChange={(open) => {
              setIsEditing(open);
              if (!open) setSelectedEntry(null);
            }}
            entry={selectedEntry}
            onUpdate={handleUpdateEntry}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default MaintenanceTracker;