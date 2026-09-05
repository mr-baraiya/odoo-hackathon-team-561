"use client";

import * as React from "react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DatePickerWithRange({ className, value, onChange }) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (range) => {
    onChange(range);
    if (range?.from && range?.to) {
      setOpen(false);
    }
  };

  const formatDateRange = () => {
    if (!value?.from) return "Pick a date";
    if (!value?.to) return format(value.from, "LLL dd, y");
    return `${format(value.from, "LLL dd, y")} - ${format(value.to, "LLL dd, y")}`;
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !value?.from && "text-muted-foreground"
            )}
          >
            {formatDateRange()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={value?.from || new Date()}
            selected={value}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

