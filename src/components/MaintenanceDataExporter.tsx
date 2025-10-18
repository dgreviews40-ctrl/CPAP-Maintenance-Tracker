"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { convertToCSV, downloadCSV } from "@/utils/csv";
import { MaintenanceEntry } from "./MaintenanceTracker"; // Re-use the type definition
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Added import
import { format } from "date-fns"; // Added import

const MaintenanceDataExporter = () => {
  const { user } = useAuth();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!user) {
      showError("You must be logged in to download data.");
      return;
    }

    setIsDownloading(true);
    
    try {
      // 1. Fetch all maintenance entries
      const { data, error } = await supabase
        .from("maintenance_entries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        showError("No maintenance data found to export.");
        setIsDownloading(false);
        return;
      }

      // 2. Define columns and headers for CSV
      const columns = [
        { key: 'id', header: 'ID' },
        { key: 'machine', header: 'Machine_Part_Model' },
        { key: 'last_maintenance', header: 'Last_Maintenance_Date' },
        { key: 'next_maintenance', header: 'Next_Maintenance_Date' },
        { key: 'notes', header: 'Notes' },
        { key: 'created_at', header: 'Record_Created_At' },
        { key: 'user_id', header: 'User_ID' },
      ];

      // 3. Convert to CSV
      const csvString = convertToCSV(data as MaintenanceEntry[], columns);

      // 4. Trigger download
      const filename = `cpap_maintenance_log_${format(new Date(), 'yyyyMMdd')}.csv`;
      downloadCSV(csvString, filename);
      
      showSuccess("Maintenance log downloaded successfully!");

    } catch (error) {
      console.error("Error exporting data:", error);
      showError("Failed to export maintenance data.");
    } finally {
      setIsDownloading(false);
    }
  }, [user]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Download className="h-5 w-5 mr-2" /> Export Maintenance Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Download your complete maintenance history log as a CSV file for external analysis or record keeping.
        </p>
        <Button 
          onClick={handleDownload} 
          disabled={isDownloading}
        >
          {isDownloading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Download Maintenance CSV
        </Button>
      </CardContent>
    </Card>
  );
};

export default MaintenanceDataExporter;