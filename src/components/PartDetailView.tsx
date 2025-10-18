"use client";

import React, { useRef, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Package, Calendar, Wrench, AlertTriangle, Info, Image as ImageIcon } from "lucide-react";
import { useUserParts, PartData } from "@/hooks/use-user-parts";
import { useCustomFrequencies } from "@/hooks/use-custom-frequencies";
import { useMaintenanceHistory, MaintenanceEntry } from "@/hooks/use-maintenance-history";
import { getMaintenanceFrequencyDays } from "@/utils/frequency";
import { format, parseISO } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import PartImageUploader from "./PartImageUploader";
import { useRQClient } from "@/hooks/use-query-client";
import { useAllMachines } from "@/hooks/use-all-machines";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { showError } from "@/utils/toast";

interface PartDetailViewProps {
  uniqueKey: string;
}

// Helper function to parse uniqueKey into labels
const parseUniqueKey = (key: string) => {
  const [machineLabel, partTypeLabel, modelLabel] = key.split('|');
  return { machineLabel, partTypeLabel, modelLabel };
};

// Helper function to safely format date strings
const safeFormatDate = (dateStr: string | undefined, formatString: string = 'MMM dd, yyyy'): string => {
  if (!dateStr) return "N/A";
  // Handle timezone issues by replacing hyphens with slashes
  const date = new Date(dateStr.replace(/-/g, "/"));
  if (isNaN(date.getTime())) return "Invalid Date";
  return format(date, formatString);
};


const PartDetailView = ({ uniqueKey }: PartDetailViewProps) => {
  const { user } = useAuth();
  const { userParts, loading: loadingParts } = useUserParts();
  const { allMachines, loading: loadingAllMachines } = useAllMachines();
  const { frequencies, loading: loadingFrequencies } = useCustomFrequencies();
  const { history, loading: loadingHistory } = useMaintenanceHistory();
  const queryClient = useRQClient();
  
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for the hidden file input
  const [isUploading, setIsUploading] = useState(false);

  const loading = loadingParts || loadingFrequencies || loadingHistory || loadingAllMachines;

  const { machineLabel, partTypeLabel, modelLabel } = parseUniqueKey(uniqueKey);
  
  // 1. Try to find details in userParts (which includes inventory/history data)
  let partDetails: PartData | undefined = userParts.find(p => p.uniqueKey === uniqueKey);
  
  // 2. If not found in userParts, construct minimal details from allMachines
  if (!partDetails && !loadingAllMachines) {
    const machineData = allMachines.find(m => m.label === machineLabel);
    const partTypeData = machineData?.parts.find(p => p.label === partTypeLabel);
    const modelData = partTypeData?.models.find(m => m.label === modelLabel);

    if (modelData) {
      // Construct a minimal PartData object
      partDetails = {
        machineLabel,
        partTypeLabel,
        modelLabel,
        reorderInfo: modelData.reorder_info,
        uniqueKey: uniqueKey,
        imageUrl: partTypeData?.image_url, // Use default image URL
        // Inventory/Quantity fields will be undefined
      };
    }
  }

  const partHistory: MaintenanceEntry[] = history[uniqueKey] || [];
  
  const defaultFrequency = partDetails ? getMaintenanceFrequencyDays(partDetails.partTypeLabel) : null;
  const customFrequency = frequencies[uniqueKey] || null;
  const effectiveFrequency = customFrequency || defaultFrequency;
  
  // Handler to refresh data after image upload/update
  const handleImageUpdated = () => {
    // Invalidate the query that fetches custom images and user parts
    queryClient.invalidateQueries({ queryKey: ['customPartImages'] });
    queryClient.invalidateQueries({ queryKey: ['userParts'] });
  };
  
  const handleFileUpload = useCallback(async (file: File) => {
    if (!user) {
      showError("You must be logged in to upload images.");
      return;
    }

    setIsUploading(true);
    
    // Define the path in storage: user_id/unique_key_hash.ext
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${uniqueKey.replace(/\|/g, '_')}.${fileExt}`;

    try {
      // 1. Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('part-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true, // Overwrite existing file
        });

      if (uploadError) throw uploadError;

      // 2. Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('part-images')
        .getPublicUrl(filePath);
        
      if (!publicUrlData.publicUrl) throw new Error("Failed to retrieve public URL.");

      // 3. Save the public URL to the database
      const { error: dbError } = await supabase
        .from("part_images")
        .upsert([{ user_id: user.id, unique_part_key: uniqueKey, image_url: publicUrlData.publicUrl }], { onConflict: 'unique_part_key' });
      
      if (dbError) throw dbError;

      handleImageUpdated();
    } catch (error) {
      console.error("Upload or save error:", error);
      showError("Image upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }, [user, uniqueKey, queryClient]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear file input
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!partDetails) {
    return (
      <Card className="w-full">
        <CardHeader><CardTitle>Part Not Found</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This part key is not defined in any machine configuration.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // Since partDetails might be minimally constructed, we check inventory status safely
  const needsReorder = partDetails.quantity !== undefined && partDetails.reorderThreshold !== undefined && partDetails.quantity <= partDetails.reorderThreshold;

  return (
    <div className="space-y-8">
      
      {/* Hidden file input for the clickable image area */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/png, image/jpeg"
        capture="environment" // Added capture attribute
        className="hidden"
        disabled={isUploading}
      />
      
      {/* Image and Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Part Image */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Part Visual</CardTitle>
            </CardHeader>
            <CardContent>
              <AspectRatio 
                ratio={1 / 1} 
                className="bg-muted rounded-lg overflow-hidden flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => fileInputRef.current?.click()} // Trigger file input on click
              >
                {isUploading ? (
                  <div className="flex flex-col items-center text-primary">
                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                    <p>Uploading...</p>
                  </div>
                ) : partDetails.imageUrl ? (
                  <img 
                    src={partDetails.imageUrl} 
                    alt={`${partDetails.modelLabel} image`} 
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="text-muted-foreground flex flex-col items-center">
                    <ImageIcon className="h-8 w-8 mb-2" />
                    <p className="text-center">Click to Upload Image/Take Photo</p>
                  </div>
                )}
              </AspectRatio>
            </CardContent>
          </Card>
          
          {/* Image Uploader (Now handles URL input and internal file button) */}
          <PartImageUploader 
            uniqueKey={uniqueKey} 
            currentImageUrl={partDetails.imageUrl}
            onImageUpdated={handleImageUpdated}
            onFileUpload={handleFileUpload}
            isUploading={isUploading}
          />
        </div>
        
        {/* Summary Stats */}
        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          {/* Inventory Status */}
          <Card className={needsReorder ? "border-red-500" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Status</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {partDetails.quantity !== undefined ? partDetails.quantity : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                Threshold: {partDetails.reorderThreshold !== undefined ? partDetails.reorderThreshold : 'N/A'}
              </p>
              {needsReorder && (
                <Badge variant="destructive" className="mt-2">
                  <AlertTriangle className="h-3 w-3 mr-1" /> Reorder Needed
                </Badge>
              )}
              {partDetails.quantity === undefined && (
                <p className="text-xs text-muted-foreground mt-2">Not tracked in Inventory.</p>
              )}
            </CardContent>
          </Card>
          
          {/* Next Maintenance */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Due Date</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {safeFormatDate(partHistory[0]?.next_maintenance)}
              </div>
              <p className="text-xs text-muted-foreground">
                Last Maintenance: {safeFormatDate(partHistory[0]?.last_maintenance)}
              </p>
              {partHistory.length === 0 && (
                <p className="text-xs text-muted-foreground mt-2">No maintenance recorded.</p>
              )}
            </CardContent>
          </Card>
          
          {/* Effective Frequency */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Effective Frequency</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {effectiveFrequency ? `${effectiveFrequency} Days` : 'Unknown'}
              </div>
              <p className="text-xs text-muted-foreground">
                {customFrequency ? 'Using Custom Setting' : (defaultFrequency ? 'Using Default Setting' : 'No Default Found')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Frequency Management Info */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Frequency Management</h2>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Info className="h-5 w-5 mr-2" /> Custom Frequency for this Part
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              To set or change the custom replacement frequency for this part, please visit the Advanced Settings page.
            </p>
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                <span className="font-medium">Current Custom Frequency:</span>
                <span className="font-bold text-primary">
                    {customFrequency ? `${customFrequency} days` : 'Default'}
                </span>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Maintenance History Table */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Maintenance History ({partHistory.length} entries)</h2>
        
        {partHistory.length === 0 ? (
          <p className="text-muted-foreground">No maintenance history recorded for this specific part.</p>
        ) : (
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Last Maintenance</TableHead>
                  <TableHead>Next Due</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Recorded On</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partHistory.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{safeFormatDate(entry.last_maintenance)}</TableCell>
                    <TableCell>{safeFormatDate(entry.next_maintenance)}</TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-muted-foreground">{entry.notes}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{safeFormatDate(entry.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
};

export default PartDetailView;