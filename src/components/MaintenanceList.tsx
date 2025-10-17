"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Trash2 } from "lucide-react";
import { MaintenanceEntry } from "./MaintenanceTracker";
import { cn } from "@/lib/utils";
import { isBefore, isWithinInterval, addDays, startOfDay } from "date-fns";

interface MaintenanceListProps {
  entries: MaintenanceEntry[];
  onDeleteEntry: (id: string) => void;
  loading: boolean;
}

// Helper function to determine the status of an entry (copied for local use/display)
const getStatus = (
  dateStr: string,
): { label: string; color: string } => {
  const today = startOfDay(new Date());
  // Handle timezone issues by replacing hyphens with slashes
  const nextMaintenanceDate = startOfDay(
    new Date(dateStr.replace(/-/g, "/")),
  );

  if (isBefore(nextMaintenanceDate, today)) {
    return { label: "Overdue", color: "bg-red-500" };
  }

  const sevenDaysFromNow = addDays(today, 7);
  if (
    isWithinInterval(nextMaintenanceDate, {
      start: today,
      end: sevenDaysFromNow,
    })
  ) {
    return { label: "Due Soon", color: "bg-yellow-500" };
  }

  return { label: "On Schedule", color: "bg-green-500" };
};


const MaintenanceList = ({
  entries,
  onDeleteEntry,
  loading,
}: MaintenanceListProps) => {
  if (loading) {
    return <p className="text-center">Loading entries...</p>;
  }

  if (entries.length === 0) {
    return (
      <p className="text-center text-gray-500">
        No maintenance entries match the current filter/sort criteria.
      </p>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">Status</TableHead>
            <TableHead>Machine</TableHead>
            <TableHead>Last Maintenance</TableHead>
            <TableHead>Next Maintenance</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => {
            const status = getStatus(entry.next_maintenance);
            return (
              <TableRow key={entry.id}>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger>
                      <div
                        className={cn("h-3 w-3 rounded-full", status.color)}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{status.label}</p>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell className="font-medium">{entry.machine}</TableCell>
                <TableCell>
                  {new Date(
                    entry.last_maintenance.replace(/-/g, "/"),
                  ).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(
                    entry.next_maintenance.replace(/-/g, "/"),
                  ).toLocaleDateString()}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {entry.notes}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteEntry(entry.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default MaintenanceList;