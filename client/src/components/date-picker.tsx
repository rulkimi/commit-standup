"use client"

import { ChevronDownIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useState } from "react";

interface DatePickerProps {
  label: string;
  date: Date | undefined;
  onChange: (date: Date | undefined) => void;
}

export default function DatePicker({ label, date, onChange }: DatePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-1">
      <Label className="px-1">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between font-normal"
          >
            {date ? date.toLocaleDateString() : "Select date"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            onSelect={(date) => {
              onChange(date);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
