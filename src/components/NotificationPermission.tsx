"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bell, CheckCircle, XCircle } from "lucide-react";

interface NotificationPermissionProps {
  onPermissionChange: (status: NotificationPermission) => void;
}

const NotificationPermission = ({ onPermissionChange }: NotificationPermissionProps) => {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>(() => {
    if (!("Notification" in window)) return 'unsupported';
    return Notification.permission;
  });

  useEffect(() => {
    if (permissionStatus !== 'unsupported') {
      onPermissionChange(permissionStatus as NotificationPermission);
    }
  }, [permissionStatus, onPermissionChange]);

  const requestPermission = async () => {
    if (permissionStatus === 'unsupported') return;

    const permission = await Notification.requestPermission();
    setPermissionStatus(permission);
  };

  if (permissionStatus === 'unsupported') {
    return (
      <Alert variant="destructive" className="mb-4">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Notifications Unsupported</AlertTitle>
        <AlertDescription>
          Your browser does not support desktop notifications.
        </AlertDescription>
      </Alert>
    );
  }

  if (permissionStatus === 'granted') {
    return (
      <Alert className="mb-4 border-green-500 text-green-700 dark:border-green-400 dark:text-green-400">
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>Notifications Enabled</AlertTitle>
        <AlertDescription>
          You will receive alerts for upcoming maintenance.
        </AlertDescription>
      </Alert>
    );
  }

  if (permissionStatus === 'denied') {
    return (
      <Alert variant="destructive" className="mb-4">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Notifications Blocked</AlertTitle>
        <AlertDescription>
          Please enable notifications in your browser settings to receive maintenance reminders.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="mb-4">
      <Bell className="h-4 w-4" />
      <AlertTitle>Enable Reminders</AlertTitle>
      <AlertDescription className="flex justify-between items-center">
        <span>Allow desktop notifications for proactive maintenance reminders.</span>
        <Button onClick={requestPermission} size="sm">
          Enable
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default NotificationPermission;