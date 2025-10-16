"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";


interface Reminder {
  id: string;
  machine: string;
  date: Date;
  message: string;
}

const Reminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newReminder, setNewReminder] = useState<{ machine: string; date: string; message: string }>({
    machine: "",
    date: "",
    message: ""
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  useEffect(() => {
    const savedReminders = localStorage.getItem("cpapReminders");
    if (savedReminders) {
      try {
        const parsedReminders = JSON.parse(savedReminders).map((r: any) => ({...r, date: new Date(r.date)}));
        setReminders(parsedReminders);
      } catch (error) {
        console.error("Failed to parse reminders from localStorage", error);
        setReminders([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cpapReminders", JSON.stringify(reminders));
  }, [reminders]);

  const resetForm = () => {
    setNewReminder({ machine: "", date: "", message: "" });
    setIsEditing(false);
    setEditingReminder(null);
  };

  const handleSubmit = () => {
    if (!newReminder.machine || !newReminder.date || !newReminder.message) return;

    if (isEditing && editingReminder) {
      const updatedReminders = reminders.map(reminder => 
        reminder.id === editingReminder.id ? { 
          ...reminder, 
          machine: newReminder.machine,
          date: new Date(newReminder.date),
          message: newReminder.message,
        } : reminder
      );
      setReminders(updatedReminders);
    } else {
      const newReminderItem: Reminder = {
        id: Date.now().toString(),
        machine: newReminder.machine,
        date: new Date(newReminder.date),
        message: newReminder.message
      };
      setReminders([...reminders, newReminderItem]);
    }
    resetForm();
  };

  const handleEdit = (reminder: Reminder) => {
    setIsEditing(true);
    setEditingReminder(reminder);
    setNewReminder({
      machine: reminder.machine,
      date: reminder.date.toISOString().split('T')[0],
      message: reminder.message,
    });
  };

  const deleteReminder = (id: string) => {
    const updatedReminders = reminders.filter(reminder => reminder.id !== id);
    setReminders(updatedReminders);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Reminders</CardTitle>
          <CardDescription>Set and manage maintenance reminders for your CPAP equipment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Machine</label>
              <Select value={newReminder.machine} onValueChange={(value) => setNewReminder({ ...newReminder, machine: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select machine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Philips Respironics DreamStation">
                    Philips Respironics DreamStation
                  </SelectItem>
                  <SelectItem value="Medtronic S90">
                    Medtronic S90
                  </SelectItem>
                  <SelectItem value="ResMed S9">
                    ResMed S9
                  </SelectItem>
                  <SelectItem value="Dual CPAP Machine">
                    Dual CPAP Machine
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Date</label>
              <Input 
                type="date" 
                value={newReminder.date} 
                onChange={(e) => setNewReminder({ ...newReminder, date: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Message</label>
              <Input 
                value={newReminder.message} 
                onChange={(e) => setNewReminder({ ...newReminder, message: e.target.value })}
                placeholder="e.g., Change filter"
              />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button onClick={handleSubmit}>
              {isEditing ? "Save Changes" : "Add Reminder"}
            </Button>
             {isEditing && <Button variant="ghost" onClick={resetForm} className="ml-2">Cancel</Button>}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Reminders</CardTitle>
          <CardDescription>View and manage your CPAP maintenance reminders</CardDescription>
        </CardHeader>
        <CardContent>
          <Separator />
          <div className="space-y-4 mt-4">
            {reminders.length === 0 ? (
              <p className="text-center text-muted-foreground">No reminders found</p>
            ) : (
              reminders.map((reminder) => (
                <div key={reminder.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{reminder.machine}</h3>
                      <p className="text-sm text-muted-foreground">
                        Reminder Date: {reminder.date.toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Message: {reminder.message}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(reminder)}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteReminder(reminder.id)}>
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