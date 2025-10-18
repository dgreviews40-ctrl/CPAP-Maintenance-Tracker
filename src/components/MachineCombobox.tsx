"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useAllMachines } from "@/hooks/use-all-machines" // Import the new hook

interface MachineComboboxProps {
  value: string;
  onChange: (value: string) => void;
}

export function MachineCombobox({ value, onChange }: MachineComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const { allMachines, loading } = useAllMachines();

  if (loading) {
    // Render a disabled button while loading
    return (
      <Button
        variant="outline"
        role="combobox"
        className="w-full justify-between"
        disabled
      >
        Loading machines...
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? allMachines.find((machine) => machine.label === value)?.label
            : "Select machine..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search machine..." />
          <CommandList>
            <CommandEmpty>No machine found.</CommandEmpty>
            <CommandGroup>
              {allMachines.map((machine) => (
                <CommandItem
                  key={machine.value}
                  value={machine.label}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === machine.label ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {machine.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}