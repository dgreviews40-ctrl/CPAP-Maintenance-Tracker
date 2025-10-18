"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListOrdered, CalendarCheck } from "lucide-react";

const UpcomingMaintenance = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CalendarCheck className="h-5 w-5 mr-2" />
          Next 7 Days Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          <li className="flex justify-between items-center p-2 border-b last:border-b-0">
            <span>Machine A - Filter Replacement</span>
            <span className="text-sm text-orange-500">Due: Tomorrow</span>
          </li>
          <li className="flex justify-between items-center p-2 border-b last:border-b-0">
            <span>Machine C - Lubrication Check</span>
            <span className="text-sm text-green-600">Due: 3 days</span>
          </li>
          <li className="flex justify-between items-center p-2 border-b last:border-b-0">
            <span>Machine B - Belt Tensioning</span>
            <span className="text-sm text-green-600">Due: 5 days</span>
          </li>
        </ul>
        <div className="mt-4 text-sm text-muted-foreground">
          <ListOrdered className="inline h-4 w-4 mr-1" /> 3 tasks scheduled this week.
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingMaintenance;