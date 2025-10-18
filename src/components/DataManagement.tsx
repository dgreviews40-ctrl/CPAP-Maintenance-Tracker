"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Trash2, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { showSuccess, showError } from "@/utils/toast";
import { backupUserData, resetAllUserData } from "@/utils/data-management";
import { useRQClient } from "@/hooks/use-query-client";

const DataManagement = () => {
  const { user } = useAuth();
  const queryClient = useRQClient();
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleBackup = async () => {
    if (!user) {
      showError("You must be logged in to backup data.");
      return;
    }

    setIsBackingUp(true);
    const data = await backupUserData(user.id);
    setIsBackingUp(false);

    if (data) {
      try {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `cpap_maintenance_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showSuccess("Data backup successful!");
      } catch (e) {
        console.error("Error creating or downloading file:", e);
        showError("Failed to create backup file.");
      }
    }
  };

  const handleReset = async () => {
    if (!user) {
      showError("You must be logged in to reset data.");
      return;
    }

    if (!window.confirm("WARNING: This will permanently delete ALL your maintenance entries, inventory, custom frequencies, and profile data. Are you absolutely sure you want to proceed?")) {
      return;
    }

    setIsResetting(true);
    const success = await resetAllUserData(user.id);
    setIsResetting(false);

    if (success) {
      showSuccess("All user data has been successfully reset!");
      // Invalidate all queries to reflect the empty state immediately
      queryClient.invalidateQueries();
    } else {
      showError("Data reset failed. Check console for details.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trash2 className="h-5 w-5 mr-2" /> Data Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Manage your application data, including backups and full data resets.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={handleBackup} 
            disabled={isBackingUp || isResetting}
            variant="outline"
            className="w-full sm:w-auto"
          >
            {isBackingUp ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Backup Data (JSON)
          </Button>
          
          <Button 
            onClick={handleReset} 
            disabled={isResetting || isBackingUp}
            variant="destructive"
            className="w-full sm:w-auto"
          >
            {isResetting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Reset All Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataManagement;