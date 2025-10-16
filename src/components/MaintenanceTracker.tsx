"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import MaintenanceList from "./MaintenanceList";
import MaintenanceForm from "./MaintenanceForm";
import { supabase } from "@/lib/supabase";

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

  const fetchEntries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("maintenance_entries")
      .select("*")
      .order("next_maintenance", { ascending: true });

    if (error) {
      console.error("Error fetching entries:", error);
      setEntries([]);
    } else {
      setEntries(data || []);
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
      return false;
    }
    
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
    } else {
      setEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Maintenance Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        <MaintenanceForm onAddEntry={addEntry} />
        <MaintenanceList entries={entries} onDeleteEntry={deleteEntry} loading={loading} />
      </CardContent>
    </Card>
  );
};

export default MaintenanceTracker;