"use client";

import { useEffect, useState } from "react";
import { useMaintenanceHistory } from "./use-maintenance-history";
import { isBefore, addDays, startOfDay, differenceInDays } from "date-fns";
import { parseMaintenanceMachineString } from "@/utils/parts";

const NOTIFICATION_CHECK_INTERVAL = 1000 * 60 * 60; // Check every hour
const DUE_SOON_THRESHOLD_DAYS = 3; // Notify if due within 3 days
const NOTIFICATION_TOGGLE_KEY = "cpap_maintenance_notifications_enabled";

export function useMaintenanceNotifications() {
  const { history, loading: loadingHistory } = useMaintenanceHistory();
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>(() => {
    if (!("Notification" in window)) return 'unsupported';
    return Notification.permission;
  });
  
  // State for user's preference (true by default if supported, or based on stored value)
  const [isEnabled, setIsEnabled] = useState(() => {
    if (!("Notification" in window)) return false;
    const stored = localStorage.getItem(NOTIFICATION_TOGGLE_KEY);
    return stored === null ? true : stored === 'true';
  });

  const handlePermissionChange = (status: NotificationPermission) => {
    setPermissionStatus(status);
  };
  
  const toggleEnabled = (checked: boolean) => {
    setIsEnabled(checked);
    localStorage.setItem(NOTIFICATION_TOGGLE_KEY, String(checked));
  };

  useEffect(() => {
    // Only proceed if history is loaded, permission is granted, AND the user has enabled the toggle
    if (loadingHistory || permissionStatus !== 'granted' || !isEnabled) return;

    const checkAndNotify = () => {
      const allEntries = Object.values(history).flat();
      const today = startOfDay(new Date());
      const dueSoonDate = addDays(today, DUE_SOON_THRESHOLD_DAYS);
      
      allEntries.forEach(entry => {
        if (!entry.next_maintenance) return; // Skip if date is missing

        const nextMaintenanceDate = startOfDay(
          new Date(entry.next_maintenance.replace(/-/g, "/")),
        );
        
        if (isNaN(nextMaintenanceDate.getTime())) return; // Skip if date is invalid

        const isOverdue = isBefore(nextMaintenanceDate, today);
        const daysAway = differenceInDays(nextMaintenanceDate, today);
        
        let title = '';
        let body = '';
        
        if (isOverdue) {
          title = `🚨 OVERDUE: ${entry.machine}`;
          body = `Maintenance was due ${Math.abs(daysAway)} days ago.`;
        } else if (daysAway >= 0 && daysAway <= DUE_SOON_THRESHOLD_DAYS) {
          title = `🔔 DUE SOON: ${entry.machine}`;
          body = `Maintenance is due in ${daysAway} days on ${nextMaintenanceDate.toLocaleDateString()}.`;
        }
        
        if (title) {
          // Use a unique tag to prevent duplicate notifications for the same entry
          const tag = `maintenance-${entry.id}`;
          
          new Notification(title, {
            body: body,
            icon: '/favicon.ico',
            tag: tag,
          });
        }
      });
    };

    // Run immediately and then set interval
    checkAndNotify();
    const intervalId = setInterval(checkAndNotify, NOTIFICATION_CHECK_INTERVAL);

    return () => clearInterval(intervalId);
  }, [history, loadingHistory, permissionStatus, isEnabled]);

  return { handlePermissionChange, permissionStatus, isEnabled, toggleEnabled };
}