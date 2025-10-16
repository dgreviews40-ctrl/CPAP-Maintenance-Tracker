"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { showError, showSuccess } from "@/utils/toast";

interface Reminder {
  id: string;
  machine: string;
  date: string;
  message: string;
}

const Reminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newReminder, setNewReminder] = useState<{
    machine: string;
    date: string;
    message: string;
  }>({
    machine: "",
    date: "",
    message: "",
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingReminderId, setEditingReminderId] = useState<string | null>(
    null,
  );

  if (!isSupabaseConfigured) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reminders</CardTitle>
          <CardDescription>
            Set and manage maintenance reminders for your CPAP equipment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-600 p-4 border border-red-200 bg-red-50 rounded-md">
            <p className="font-bold">Supabase Not Configured</p>
            <p className="text-sm">
              Please ensure your Supabase URL and Key are set in your
              environment variables.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const fetchReminders = async () => {
    const { data, error } = await supabase!
      .from("reminders")
      .select("*")
      .order("date", { ascending: true });

    if (error) {
      console.error("Error fetching reminders:", error);
      showError("Could not fetch reminders.");
    } else {
      setReminders(data as Reminder[]);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const resetForm = () => {
    setNewReminder({ machine: "", date: "", message: "" });
    setIsEditing(false);
    setEditingReminderId(null);
  };

  const handleSubmit = async () => {
    if (!newReminder.machine || !newReminder.date || !newReminder.message) {
      showError("Please fill in all fields.");
      return;
    }

    const reminderData = {
      machine: newReminder.machine,
      date: newReminder.date,
      message: newReminder.message,
    };

    if (isEditing && editingReminderId) {
      const { error } = await supabase!
        .from("reminders")
        .update(reminderData)
        .eq("id", editingReminderId);

      if (error) {
        console.error("Error updating reminder:", error);
        showError("Failed to save changes.");
      } else {
        showSuccess("Reminder updated!");
        fetchReminders();
      }
    } else {
      const { error } = await supabase!
        .from("reminders")
        .insert([reminderData]);

      if (error) {
        console.error("Error adding reminder:", error);
        showError("Failed to add new reminder.");
      } else {
        showSuccess("New reminder added!");
        fetchReminders();
      }
    }
    resetForm();
  };

  const handleEdit = (reminder: Reminder) => {
    setIsEditing(true);
    setEditingReminderId(reminder.id);
    setNewReminder({
      machine: reminder.machine,
      date: reminder.date,
      message: reminder.message,
    });
  };

  const deleteReminder = async (id: string) => {
    const { error } = await supabase!
      .from("reminders")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting reminder:", error);
      showError("Failed to delete reminder.");
    } else {
      showSuccess("Reminder deleted.");
      fetchReminders();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Reminders</CardTitle>
          <CardDescription>
            Set and manage maintenance reminders for your CPAP equipment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Machine
              </label>
              <Select
                value={newReminder.machine}
                onValueChange={(value) =>
                  setNewReminder({ ...newReminder, machine: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select machine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Philips Respironics DreamStation">
                    Philips Respironics DreamStation
                  </SelectItem>
                  <SelectItem value="Medtronic S90">Medtronic S90</SelectItem>
                  <SelectItem value="ResMed S9">ResMed S9</SelectItem>
                  <SelectItem value="Dual CPAP Machine">
                    Dual CPAP Machine
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Date
              </label>
              <Input
                type="date"
                value={newReminder.date}
                onChange={(e) =>
                  setNewReminder({ ...newReminder, date: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Message
              </label>
              <Input
                value={newReminder.message}
                onChange={(e) =>
                  setNewReminder({ ...newReminder, message: e.target.value })
                }
                placeholder="e.g., Change filter"
              />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button onClick={handleSubmit}>
              {isEditing ? "Save Changes" : "Add Reminder"}
            </Button>
            {isEditing && (
              <Button variant="ghost" onClick={resetForm} className="ml-2">
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Reminders</CardTitle>
          <CardDescription>
            View and manage your CPAP maintenance reminders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Separator />
          <div className="space-y-4 mt-4">
            {reminders.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No reminders found
              </p>
            ) : (
              reminders.map((reminder) => (
                <div key={reminder.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{reminder.machine}</h3>
                      <p className="text-sm text-muted-foreground">
                        Reminder Date:{" "}
                        {new Date(
                          reminder.date.replace(/-/g, "/"),
                        ).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Message: {reminder.message}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(reminder)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteReminder(reminder.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reminders;