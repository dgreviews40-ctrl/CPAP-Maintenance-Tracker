"use client";

import { useEffect, useState } from "react";
import { useMaintenanceHistory } from "./use-maintenance-history";
import { isBefore, addDays, startOfDay, differenceInDays } from "date-fns";
import { parseMaintenanceMachineString } from "@/utils/parts";

const NOTIFICATION_CHECK_INTERVAL = 1000 * 60 * 60; // Check every hour
const DUE_SOON_THRESHOLD_DAYS = 3; // Notify if due within 3 days

export function useMaintenanceNotifications() {
  const { history, loading: loadingHistory } = useMaintenanceHistory();
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>(() => {
    if (!("Notification" in window)) return 'unsupported';
    return Notification.permission;
  });

  const handlePermissionChange = (status: NotificationPermission) => {
    setPermissionStatus(status);
  };

  useEffect(() => {
    if (loadingHistory || permissionStatus !== 'granted') return;

    const checkAndNotify = () => {
      const allEntries = Object.values(history).flat();
      const today = startOfDay(new Date());
      const dueSoonDate = addDays(today, DUE_SOON_THRESHOLD_DAYS);
      
      allEntries.forEach(entry => {
        const nextMaintenanceDate = startOfDay(
          new Date(entry.next_maintenance.replace(/-/g, "/")),
        );
        
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
          
          // Check if a notification with this tag was already shown recently (e.g., in the last hour)
          // Note: We rely on the browser's notification API to handle display, but we can add a simple local storage check if needed for aggressive throttling.
          
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
  }, [history, loadingHistory, permissionStatus]);

  return { handlePermissionChange, permissionStatus };
}