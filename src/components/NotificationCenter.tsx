"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";
import NotificationPermission from "./NotificationPermission";
import { useMaintenanceNotifications } from "@/hooks/use-maintenance-notifications";

const NotificationCenter = () => {
  const { handlePermissionChange } = useMaintenanceNotifications();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Bell className="h-5 w-5 mr-2" /> Reminders & Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <NotificationPermission onPermissionChange={handlePermissionChange} />
        {/* Future: Add a list of recent in-app alerts here */}
      </CardContent>
    </Card>
  );
};

export default NotificationCenter;