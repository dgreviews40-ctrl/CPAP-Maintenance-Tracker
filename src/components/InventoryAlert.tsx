"use client";

import { useUserParts } from "@/hooks/use-user-parts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const InventoryAlert = () => {
  const { userParts, loading } = useUserParts();

  if (loading) {
    return null; // Wait for loading
  }

  const partsNeedingReorder = userParts.filter(
    (part) => 
      part.quantity !== undefined && 
      part.reorderThreshold !== undefined && 
      part.quantity <= part.reorderThreshold
  );

  if (partsNeedingReorder.length === 0) {
    return null;
  }
  
  const alertMessage = partsNeedingReorder.length === 1
    ? `1 part needs reordering: ${partsNeedingReorder[0].modelLabel} (${partsNeedingReorder[0].quantity} left).`
    : `${partsNeedingReorder.length} parts are below their reorder threshold.`;

  return (
    <Alert 
      className={cn(
        "mb-6 border-yellow-500 bg-yellow-500/10 text-yellow-700 dark:border-yellow-400 dark:text-yellow-400",
        "flex items-start"
      )}
    >
      <AlertTriangle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
      <div>
        <AlertTitle className="text-lg font-semibold flex items-center">
          <Package className="h-4 w-4 mr-2" /> Low Inventory Alert
        </AlertTitle>
        <AlertDescription className="mt-1">
          {alertMessage}
          <Link to="/inventory" className="ml-2 underline font-medium hover:text-yellow-300">
            View Inventory
          </Link>
        </AlertDescription>
      </div>
    </Alert>
  );
};

export default InventoryAlert;