"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Package } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { convertToCSV, downloadCSV } from "@/utils/csv";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface InventoryItem {
  id: string;
  machine_label: string;
  part_type_label: string;
  part_model_label: string;
  reorder_info: string | null;
  quantity: number;
  reorder_threshold: number;
  last_restock: string | null;
  created_at: string;
}

const InventoryDataExporter = () => {
  const { user } = useAuth();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!user) {
      showError("You must be logged in to download data.");
      return;
    }

    setIsDownloading(true);
    
    try {
      // 1. Fetch all inventory entries
      const { data, error } = await supabase
        .from("part_inventory")
        .select("*")
        .order("machine_label", { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        showError("No inventory data found to export.");
        setIsDownloading(false);
        return;
      }

      // 2. Define columns and headers for CSV
      const columns = [
        { key: 'id', header: 'ID' },
        { key: 'machine_label', header: 'Machine_Label' },
        { key: 'part_type_label', header: 'Part_Type_Label' },
        { key: 'part_model_label', header: 'Part_Model_Label' },
        { key: 'reorder_info', header: 'Reorder_SKU' },
        { key: 'quantity', header: 'Current_Quantity' },
        { key: 'reorder_threshold', header: 'Reorder_Threshold' },
        { key: 'last_restock', header: 'Last_Restock_Date' },
        { key: 'created_at', header: 'Record_Created_At' },
        { key: 'user_id', header: 'User_ID' },
      ];

      // 3. Convert to CSV
      const csvString = convertToCSV(data as InventoryItem[], columns);

      // 4. Trigger download
      const filename = `cpap_inventory_log_${format(new Date(), 'yyyyMMdd')}.csv`;
      downloadCSV(csvString, filename);
      
      showSuccess("Inventory log downloaded successfully!");

    } catch (error) {
      console.error("Error exporting inventory data:", error);
      showError("Failed to export inventory data.");
    } finally {
      setIsDownloading(false);
    }
  }, [user]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Package className="h-5 w-5 mr-2" /> Export Inventory Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Download your complete spare parts inventory log as a CSV file.
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
          Download Inventory CSV
        </Button>
      </CardContent>
    </Card>
  );
};

export default InventoryDataExporter;