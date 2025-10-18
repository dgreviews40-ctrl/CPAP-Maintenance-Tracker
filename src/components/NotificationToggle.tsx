"use client";

import { useMaintenanceNotifications } from "@/hooks/use-maintenance-notifications";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

const NotificationToggle = () => {
  const { isEnabled, toggleEnabled, permissionStatus } = useMaintenanceNotifications();

  if (permissionStatus !== 'granted') {
    return (
      <Alert className="mb-4 border-l-4 border-yellow-500 bg-yellow-500/10">
        <Info className="h-4 w-4" />
        <AlertTitle>Toggle Disabled</AlertTitle>
        <AlertDescription>
          You must grant browser permission first before enabling or disabling reminders.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
      <Label htmlFor="notification-toggle" className="flex flex-col space-y-1">
        <span className="text-base font-semibold">Maintenance Reminders</span>
        <span className="text-sm text-muted-foreground">
          {isEnabled ? "Desktop notifications are currently ON." : "Desktop notifications are currently OFF."}
        </span>
      </Label>
      <Switch
        id="notification-toggle"
        checked={isEnabled}
        onCheckedChange={toggleEnabled}
      />
    </div>
  );
};

export default NotificationToggle;