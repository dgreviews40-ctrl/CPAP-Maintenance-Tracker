"use client";

import { useMaintenanceNotifications } from "@/hooks/use-maintenance-notifications";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, BellOff, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className={cn(
      "flex items-center justify-between p-4 border rounded-lg transition-colors",
      isEnabled 
        ? "bg-green-500/10 border-green-500/50" 
        : "bg-red-500/10 border-red-500/50"
    )}>
      <Label htmlFor="notification-toggle" className="flex flex-col space-y-1">
        <span className={cn("text-base font-semibold flex items-center", isEnabled ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
          {isEnabled ? <Bell className="h-5 w-5 mr-2" /> : <BellOff className="h-5 w-5 mr-2" />}
          Maintenance Reminders
        </span>
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