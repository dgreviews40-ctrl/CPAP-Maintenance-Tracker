"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUserParts } from "@/hooks/use-user-parts";
import { Info, AlertTriangle, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const InventoryAlert = () => {
  const { userParts, loading } = useUserParts();

  if (loading) {
    return null; // Hide while loading
  }

  const partsNeedingReorder = userParts.filter(part => 
    part.quantity !== undefined && 
    part.reorderThreshold !== undefined && 
    part.quantity <= part.reorderThreshold
  );

  if (partsNeedingReorder.length === 0) {
    return null;
  }

  const alertMessage = partsNeedingReorder.length === 1
    ? `1 part is below the reorder threshold: ${partsNeedingReorder[0].modelLabel} (${partsNeedingReorder[0].quantity} left).`
    : `${partsNeedingReorder.length} parts are below their reorder thresholds.`;

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        Inventory Reorder Alert!
        <Link to="/inventory">
          <Button variant="secondary" size="sm" className="h-7">
            <Package className="h-4 w-4 mr-2" /> View Inventory
          </Button>
        </Link>
      </AlertTitle>
      <AlertDescription>
        {alertMessage} Check your <Link to="/inventory" className="underline font-medium">Part Inventory</Link> for details.
      </AlertDescription>
    </Alert>
  );
};

export default InventoryAlert;