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
import { Trash2, Pencil, MoreHorizontal } from "lucide-react";
import { MaintenanceEntry } from "./MaintenanceTracker";
import { cn } from "@/lib/utils";
import { isBefore, isWithinInterval, addDays, startOfDay } from "date-fns";
import MarkAsDoneButton from "./MarkAsDoneButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom"; // Import Link
import { parseMaintenanceMachineString, generateUniqueKey } from "@/utils/parts"; // Import utilities

interface MaintenanceListProps {
  entries: MaintenanceEntry[];
  onDeleteEntry: (id: string) => void;
  onEditEntry: (entry: MaintenanceEntry) => void;
  onCompleteMaintenance: (id: string, newLastDate: string, newNextDate: string) => Promise<boolean>; // New prop
  loading: boolean;
}

// Helper function to determine the status of an entry
const getStatus = (
  dateStr: string,
): { label: string; color: string } => {
  if (!dateStr) {
    return { label: "Unknown", color: "bg-gray-500" };
  }
  
  const today = startOfDay(new Date());
  // Handle timezone issues by replacing hyphens with slashes
  const nextMaintenanceDate = startOfDay(
    new Date(dateStr.replace(/-/g, "/")),
  );
  
  if (isNaN(nextMaintenanceDate.getTime())) {
    return { label: "Invalid Date", color: "bg-gray-500" };
  }

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
    return { label: "Due Soon", color: "bg-yellow-500" }; // <-- Fixed: Added closing brace and semicolon
  }

  return { label: "On Schedule", color: "bg-green-500" };
};

// Helper function to safely format date strings
const safeFormatDate = (dateStr: string): string => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr.replace(/-/g, "/"));
  if (isNaN(date.getTime())) return "Invalid Date";
  return date.toLocaleDateString();
};


const MaintenanceList = ({
  entries,
  onDeleteEntry,
  onEditEntry,
  onCompleteMaintenance,
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
    <div className="border rounded-lg overflow-x-auto">
      <Table className="min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">Status</TableHead>
            <TableHead className="min-w-[200px]">Machine / Part</TableHead>
            <TableHead className="w-[120px]">Last</TableHead>
            <TableHead className="w-[120px]">Next Due</TableHead>
            <TableHead className="w-[100px]">Notes</TableHead>
            <TableHead className="text-right w-[150px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry, index) => {
            const status = getStatus(entry.next_maintenance);
            const { machineLabel, partTypeLabel, modelLabel } = parseMaintenanceMachineString(entry.machine);
            const uniqueKey = generateUniqueKey(machineLabel, partTypeLabel, modelLabel);
            
            return (
              <TableRow 
                key={entry.id}
                className={cn(
                  // Alternating row color for better readability
                  index % 2 === 1 ? "bg-muted/10" : "",
                  // Highlight overdue rows slightly more
                  status.label === "Overdue" && "bg-red-900/10 hover:bg-red-900/20"
                )}
              >
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
                <TableCell className="font-medium max-w-xs truncate">
                  <Link 
                    to={`/part/${encodeURIComponent(uniqueKey)}`}
                    className="hover:underline text-primary font-medium"
                  >
                    {entry.machine}
                  </Link>
                </TableCell>
                <TableCell>
                  {safeFormatDate(entry.last_maintenance)}
                </TableCell>
                <TableCell>
                  {safeFormatDate(entry.next_maintenance)}
                </TableCell>
                <TableCell className="max-w-[100px] truncate text-sm text-muted-foreground">
                  {entry.notes}
                </TableCell>
                <TableCell className="text-right space-x-1 flex items-center justify-end">
                  <MarkAsDoneButton 
                    entry={entry} 
                    onComplete={onCompleteMaintenance} 
                  />
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditEntry(entry)}>
                        <Pencil className="h-4 w-4 mr-2" /> Edit Entry
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDeleteEntry(entry.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Delete Entry
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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