"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";


interface MaintenanceEntry {
  id: string;
  machine: string;
  lastMaintenance: Date;
  nextMaintenance: Date;
  notes: string;
}

const MaintenanceTracker = () => {
  const [machines, setMachines] = useState<string[]>(["Philips Respironics DreamStation", "Medtronic S90", "ResMed S9", "Dual CPAP Machine"]);
  const [currentMachine, setCurrentMachine] = useState<string>("Philips Respironics DreamStation");
  const [lastMaintenance, setLastMaintenance] = useState<string>("");
  const [nextMaintenance, setNextMaintenance] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [entries, setEntries] = useState<MaintenanceEntry[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingEntry, setEditingEntry] = useState<MaintenanceEntry | null>(null);

  useEffect(() => {
    const savedEntries = localStorage.getItem("cpapMaintenanceEntries");
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cpapMaintenanceEntries", JSON.stringify(entries));
  }, [entries]);

  const addEntry = () => {
    if (!lastMaintenance || !nextMaintenance) return;
    
    const newEntry: MaintenanceEntry = {
      id: Date.now().toString(),
      machine: currentMachine,
      lastMaintenance: new Date(lastMaintenance),
      nextMaintenance: new Date(nextMaintenance),
      notes: notes || ""
    };
    
    setEntries([...entries, newEntry]);
    setLastMaintenance("");
    setNextMaintenance("");
    setNotes("");
    setIsEditing(false);
  };

  const editEntry = (entry: MaintenanceEntry) => {
    setEditingEntry(entry);
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (!editingEntry) return;
    
    const updatedEntries = entries.map(entry => 
      entry.id === editingEntry.id ? { ...entry, ...editingEntry } : entry
    );
    
    setEntries(updatedEntries);
    setIsEditing(false);
    setEditingEntry(null);
  };

  const deleteEntry = (id: string) => {
    const updatedEntries = entries.filter(entry => entry.id !== id);
    setEntries(updatedEntries);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>CPAP Maintenance Tracker</CardTitle>
          <CardDescription>Track maintenance schedules and reminders for your CPAP equipment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Input 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                className="h-24"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={isEditing ? saveEdit : addEntry}>
              {isEditing ? "Save Changes" : "Add Maintenance"}
            </Button>
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
                        Last Maintenance: {entry.lastMaintenance.toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Next Maintenance: {entry.nextMaintenance.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => editEntry(entry)}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteEntry(entry.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                  {entry.notes && (
                    <p className="mt-2 text-sm text-muted-foreground">{entry.notes}</p>
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