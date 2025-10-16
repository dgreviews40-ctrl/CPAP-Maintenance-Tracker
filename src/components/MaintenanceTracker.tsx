"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { showError, showSuccess } from "@/utils/toast";

interface MaintenanceEntry {
  id: string;
  machine: string;
  last_maintenance: string;
  next_maintenance: string;
  notes: string;
}

const MaintenanceTracker = () => {
  const [machines] = useState<string[]>(["Philips Respironics DreamStation", "Medtronic S90", "ResMed S9", "Dual CPAP Machine"]);
  const [currentMachine, setCurrentMachine] = useState<string>("Philips Respironics DreamStation");
  const [lastMaintenance, setLastMaintenance] = useState<string>("");
  const [nextMaintenance, setNextMaintenance] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [entries, setEntries] = useState<MaintenanceEntry[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  const fetchEntries = async () => {
    const { data, error } = await supabase
      .from("maintenance_entries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching maintenance entries:", error);
      showError("Could not fetch maintenance records.");
    } else {
      setEntries(data as MaintenanceEntry[]);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const resetForm = () => {
    setCurrentMachine("Philips Respironics DreamStation");
    setLastMaintenance("");
    setNextMaintenance("");
    setNotes("");
    setIsEditing(false);
    setEditingEntryId(null);
  };

  const handleSubmit = async () => {
    if (!lastMaintenance || !nextMaintenance) {
        showError("Please fill in both maintenance dates.");
        return;
    }

    const entryData = {
      machine: currentMachine,
      last_maintenance: lastMaintenance,
      next_maintenance: nextMaintenance,
      notes: notes,
    };

    if (isEditing && editingEntryId) {
      const { error } = await supabase
        .from("maintenance_entries")
        .update(entryData)
        .eq("id", editingEntryId);
      
      if (error) {
        console.error("Error updating entry:", error);
        showError("Failed to save changes.");
      } else {
        showSuccess("Maintenance record updated!");
        fetchEntries();
      }
    } else {
      const { error } = await supabase
        .from("maintenance_entries")
        .insert([entryData]);

      if (error) {
        console.error("Error adding entry:", error);
        showError("Failed to add new record.");
      } else {
        showSuccess("New maintenance record added!");
        fetchEntries();
      }
    }
    resetForm();
  };

  const handleEdit = (entry: MaintenanceEntry) => {
    setIsEditing(true);
    setEditingEntryId(entry.id);
    setCurrentMachine(entry.machine);
    setLastMaintenance(entry.last_maintenance);
    setNextMaintenance(entry.next_maintenance);
    setNotes(entry.notes);
  };

  const deleteEntry = async (id: string) => {
    const { error } = await supabase
      .from("maintenance_entries")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting entry:", error);
      showError("Failed to delete record.");
    } else {
      showSuccess("Maintenance record deleted.");
      fetchEntries();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>CPAP Maintenance Tracker</CardTitle>
          <CardDescription>Track maintenance schedules for your CPAP equipment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Machine</label>
              <Select value={currentMachine} onValueChange={setCurrentMachine}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select machine" />
                </SelectTrigger>
                <SelectContent>
                  {machines.map(machine => (
                    <SelectItem key={machine} value={machine}>
                      {machine}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Last Maintenance</label>
              <Input 
                type="date" 
                value={lastMaintenance} 
                onChange={(e) => setLastMaintenance(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Next Maintenance</label>
              <Input 
                type="date" 
                value={nextMaintenance} 
                onChange={(e) => setNextMaintenance(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Notes</label>
              <Textarea
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes here..."
              />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button onClick={handleSubmit}>
              {isEditing ? "Save Changes" : "Add Entry"}
            </Button>
            {isEditing && <Button variant="ghost" onClick={resetForm} className="ml-2">Cancel</Button>}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Maintenance History</CardTitle>
          <CardDescription>View and manage your CPAP maintenance records</CardDescription>
        </CardHeader>
        <CardContent>
          <Separator />
          <div className="space-y-4 mt-4">
            {entries.length === 0 ? (
              <p className="text-center text-muted-foreground">No maintenance records found</p>
            ) : (
              entries.map((entry) => (
                <div key={entry.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{entry.machine}</h3>
                      <p className="text-sm text-muted-foreground">
                        Last Maintenance: {new Date(entry.last_maintenance.replace(/-/g, '/')).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Next Maintenance: {new Date(entry.next_maintenance.replace(/-/g, '/')).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(entry)}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteEntry(entry.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                  {entry.notes && (
                    <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">Notes: {entry.notes}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceTracker;