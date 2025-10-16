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
import { Trash2 } from "lucide-react";
import { MaintenanceEntry } from "./MaintenanceTracker";

interface MaintenanceListProps {
  entries: MaintenanceEntry[];
  onDeleteEntry: (id: string) => void;
  loading: boolean;
}

const MaintenanceList = ({ entries, onDeleteEntry, loading }: MaintenanceListProps) => {
  if (loading) {
    return <p className="text-center">Loading entries...</p>;
  }

  if (entries.length === 0) {
    return <p className="text-center text-gray-500">No maintenance entries yet. Add one above!</p>;
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Machine</TableHead>
            <TableHead>Last Maintenance</TableHead>
            <TableHead>Next Maintenance</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="font-medium">{entry.machine}</TableCell>
              <TableCell>{new Date(entry.last_maintenance).toLocaleDateString()}</TableCell>
              <TableCell>{new Date(entry.next_maintenance).toLocaleDateString()}</TableCell>
              <TableCell className="max-w-xs truncate">{entry.notes}</TableCell>
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MaintenanceList;