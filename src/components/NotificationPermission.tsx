"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMaintenanceNotifications } from "@/hooks/use-maintenance-notifications";

interface NotificationPermissionProps {
  onPermissionChange: (status: NotificationPermission) => void;
}

const NotificationPermission = ({ onPermissionChange }: NotificationPermissionProps) => {
  const { permissionStatus } = useMaintenanceNotifications();

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      return;
    }
    const permission = await Notification.requestPermission();
    onPermissionChange(permission);
  };

  if (permissionStatus === 'granted') {
    return (
      <Alert className="border-l-4 border-green-500 bg-green-500/10">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-700">Browser Permission Granted</AlertTitle>
        <AlertDescription>
          The browser is configured to allow desktop notifications.
        </AlertDescription>
      </Alert>
    );
  }

  if (permissionStatus === 'denied') {
    return (
      <Alert className="border-l-4 border-red-500 bg-red-500/10">
        <XCircle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-700">Browser Permission Denied</AlertTitle>
        <AlertDescription>
          Notifications are blocked by your browser settings. Please check your site permissions to enable them.
        </AlertDescription>
      </Alert>
    );
  }

  if (permissionStatus === 'default') {
    return (
      <Alert className="border-l-4 border-blue-500 bg-blue-500/10">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-700">Permission Required</AlertTitle>
        <AlertDescription>
          Click below to allow desktop notifications for maintenance reminders.
        </AlertDescription>
        <div className="mt-3">
          <Button onClick={requestPermission} size="sm">
            Enable Notifications
          </Button>
        </div>
      </Alert>
    );
  }
  
  // Fallback for unsupported
  return (
    <Alert className="border-l-4 border-gray-500 bg-gray-500/10">
      <Info className="h-4 w-4 text-gray-600" />
      <AlertTitle className="text-gray-700">Notifications Unsupported</AlertTitle>
      <AlertDescription>
        Your browser does not support desktop notifications.
      </AlertDescription>
    </Alert>
  );
};

export default NotificationPermission;