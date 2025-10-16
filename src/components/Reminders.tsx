"use client";

import { useState, useEffect } from "react";


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
      setReminders(JSON.parse(savedReminders));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cpapReminders", JSON.stringify(reminders));
  }, [reminders]);

  const addReminder = () => {
    if (!newReminder.machine || !newReminder.date || !newReminder.message) return;
    
    const newReminderItem: Reminder = {
      id: Date.now().toString(),
      machine: newReminder.machine,
      date: new Date(newReminder.date),
      message: newReminder.message
    };
    
    setReminders([...reminders, newReminderItem]);
    setNewReminder({ machine: "", date: "", message: "" });
    setIsEditing(false);
  };

  const editReminder = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (!editingReminder) return;
    
    const updatedReminders = reminders.map(reminder => 
      reminder.id === editingReminder.id ? { ...reminder, ...newReminder } : reminder
    );
    
    setReminders(updatedReminders);
    setIsEditing(false);
    setEditingReminder(null);
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="h-24"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={isEditing ? saveEdit : addReminder}>
              {isEditing ? "Save Changes" : "Add Reminder"}
            </Button>
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
                      <Button variant="ghost" size="sm" onClick={() => editReminder(reminder)}>
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