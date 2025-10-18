"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Package, CheckCircle } from "lucide-react";
import { useUserParts } from "@/hooks/use-user-parts";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const LowInventoryWidget = () => {
  const { userParts, loading } = useUserParts();

  if (loading) {
    return (
      <Card className="lg:col-span-1 h-full">
        <CardContent className="flex justify-center items-center h-48">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const partsNeedingReorder = userParts.filter(part => 
    part.quantity !== undefined && 
    part.reorderThreshold !== undefined && 
    part.quantity <= part.reorderThreshold
  );

  return (
    <Card className="lg:col-span-1 h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold flex items-center">
          <Package className="h-5 w-5 mr-2 text-primary" /> Low Inventory
        </CardTitle>
        <Link to="/inventory">
          <Button variant="outline" size="sm">View All</Button>
        </Link>
      </CardHeader>
      <CardContent className="pt-4">
        {partsNeedingReorder.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-red-500 font-medium flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" /> {partsNeedingReorder.length} Part{partsNeedingReorder.length !== 1 ? 's' : ''} need reordering.
            </p>
            <ul className="space-y-2 text-sm">
              {partsNeedingReorder.slice(0, 5).map(part => (
                <li key={part.uniqueKey} className="flex justify-between items-center border-b pb-1 last:border-b-0">
                  <span className="truncate pr-2">{part.modelLabel}</span>
                  <span className="font-semibold text-red-500 flex-shrink-0">
                    {part.quantity} / {part.reorderThreshold}
                  </span>
                </li>
              ))}
              {partsNeedingReorder.length > 5 && (
                <li className="text-xs text-muted-foreground pt-1">
                  ...and {partsNeedingReorder.length - 5} more.
                </li>
              )}
            </ul>
          </div>
        ) : (
          <div className="text-center p-8 border rounded-lg bg-green-500/10">
            <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-3" />
            <p className="text-lg font-medium">Inventory is Healthy!</p>
            <p className="text-sm text-muted-foreground">No parts below threshold.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LowInventoryWidget;