"use client";

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
import PartImageUploader from "./PartImageUploader"; // Import the new component
import { useRQClient } from "@/hooks/use-query-client"; // Import RQ Client for manual refetch

interface PartDetailViewProps {
  uniqueKey: string;
}

const PartDetailView = ({ uniqueKey }: PartDetailViewProps) => {
  const { userParts, loading: loadingParts, refetchUserParts } = useUserParts();
  const { frequencies, loading: loadingFrequencies } = useCustomFrequencies();
  const { history, loading: loadingHistory } = useMaintenanceHistory();
  const queryClient = useRQClient();

  const loading = loadingParts || loadingFrequencies || loadingHistory;

  const partDetails: PartData | undefined = userParts.find(p => p.uniqueKey === uniqueKey);
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
            This part key is not currently tracked in your maintenance entries or inventory.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  const needsReorder = partDetails.quantity !== undefined && partDetails.reorderThreshold !== undefined && partDetails.quantity <= partDetails.reorderThreshold;

  return (
    <div className="space-y-8">
      
      {/* Image and Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Part Image */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Part Visual</CardTitle>
            </CardHeader>
            <CardContent>
              <AspectRatio ratio={1 / 1} className="bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                {partDetails.imageUrl ? (
                  <img 
                    src={partDetails.imageUrl} 
                    alt={`${partDetails.modelLabel} image`} 
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="text-muted-foreground flex flex-col items-center">
                    <ImageIcon className="h-8 w-8 mb-2" />
                    <p>No Image Available</p>
                  </div>
                )}
              </AspectRatio>
            </CardContent>
          </Card>
          
          {/* Image Uploader */}
          <PartImageUploader 
            uniqueKey={uniqueKey} 
            currentImageUrl={partDetails.imageUrl}
            onImageUpdated={handleImageUpdated}
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
                {partHistory[0]?.next_maintenance ? format(parseISO(partHistory[0].next_maintenance), 'MMM dd, yyyy') : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                Last Maintenance: {partHistory[0]?.last_maintenance ? format(parseISO(partHistory[0].last_maintenance), 'MMM dd, yyyy') : 'N/A'}
              </p>
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
                    <TableCell>{format(parseISO(entry.last_maintenance), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{format(parseISO(entry.next_maintenance), 'MMM dd, yyyy')}</TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-muted-foreground">{entry.notes}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{format(parseISO(entry.created_at), 'MMM dd, yyyy')}</TableCell>
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