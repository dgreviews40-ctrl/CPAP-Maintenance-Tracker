"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MachineCombobox } from "./MachineCombobox";

export type MaintenanceFilter = "all" | "overdue" | "due_soon" | "on_schedule";
export type MaintenanceSortKey = "next_maintenance" | "machine";
export type MaintenanceSortOrder = "asc" | "desc";

interface MaintenanceControlsProps {
  filter: MaintenanceFilter;
  onFilterChange: (filter: MaintenanceFilter) => void;
  sortKey: MaintenanceSortKey;
  onSortKeyChange: (key: MaintenanceSortKey) => void;
  sortOrder: MaintenanceSortOrder;
  onSortOrderChange: (order: MaintenanceSortOrder) => void;
  machineFilter: string; // New prop for machine filter
  onMachineFilterChange: (machine: string) => void; // New handler
}

const MaintenanceControls = ({
  filter,
  onFilterChange,
  sortKey,
  onSortKeyChange,
  sortOrder,
  onSortOrderChange,
  machineFilter,
  onMachineFilterChange,
}: MaintenanceControlsProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg bg-muted/50 mb-6">
      {/* Filter by Machine */}
      <div className="flex-1 space-y-1">
        <Label htmlFor="filter-machine">Filter by Machine</Label>
        <MachineCombobox 
          value={machineFilter} 
          onChange={onMachineFilterChange} 
        />
      </div>

      {/* Filter by Status */}
      <div className="flex-1 space-y-1">
        <Label htmlFor="filter-status">Filter by Status</Label>
        <Select
          value={filter}
          onValueChange={(value: MaintenanceFilter) => onFilterChange(value)}
        >
          <SelectTrigger id="filter-status">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entries</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="due_soon">Due Soon (7 days)</SelectItem>
            <SelectItem value="on_schedule">On Schedule</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sort by Column */}
      <div className="flex-1 space-y-1">
        <Label htmlFor="sort-key">Sort By</Label>
        <Select
          value={sortKey}
          onValueChange={(value: MaintenanceSortKey) => onSortKeyChange(value)}
        >
          <SelectTrigger id="sort-key">
            <SelectValue placeholder="Sort by column" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="next_maintenance">Next Maintenance Date</SelectItem>
            <SelectItem value="machine">Machine Name</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sort Order */}
      <div className="flex-shrink-0 space-y-1">
        <Label>Order</Label>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")}
        >
          {sortOrder === "asc" ? (
            <>
              <ArrowUp className="h-4 w-4 mr-2" /> Ascending
            </>
          ) : (
            <>
              <ArrowDown className="h-4 w-4 mr-2" /> Descending
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default MaintenanceControls;