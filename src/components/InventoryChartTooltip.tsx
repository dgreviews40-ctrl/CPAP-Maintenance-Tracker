"use client";

import React from 'react';
import { TooltipProps } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';

interface ChartData {
  name: string;
  quantity: number;
  threshold: number;
  uniqueKey: string; // Added uniqueKey
}

type CustomTooltipProps = TooltipProps<number, string> & {
  active: boolean;
  payload: any[];
  label: string;
};

const InventoryChartTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ChartData;
    
    // Extract part name and machine name from the label (e.g., "Model (Machine)")
    const match = label.match(/(.*)\s\((.*)\)/);
    const partName = match ? match[1].trim() : label;
    const machineName = match ? match[2].trim() : 'N/A';

    return (
      <Card className="p-2 shadow-lg border">
        <CardContent className="p-2 space-y-1">
          <Link 
            to={`/part/${encodeURIComponent(data.uniqueKey)}`}
            className="text-sm font-bold text-primary hover:underline flex items-center"
          >
            <Package className="h-4 w-4 mr-1" /> {partName}
          </Link>
          <p className="text-xs text-muted-foreground mb-1">Machine: {machineName}</p>
          
          <div className="text-sm">
            <span className="font-medium" style={{ color: payload[0].color }}>Quantity:</span> {data.quantity}
          </div>
          <div className="text-sm">
            <span className="font-medium" style={{ color: payload[1].color }}>Threshold:</span> {data.threshold}
          </div>
          
          {data.quantity <= data.threshold && (
            <p className="text-xs text-red-500 font-semibold pt-1">Reorder Alert!</p>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default InventoryChartTooltip;