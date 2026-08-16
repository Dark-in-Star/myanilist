"use client";

import { useState } from "react";
import { CalendarDays, X } from "lucide-react";
import { Calendar } from "@/components/Calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDate } from "@/lib/format";

export function DateField({
  label,
  placeholder = "Any date",
  value,
  onChange,
  minDate,
  maxDate,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  minDate?: string;
  maxDate?: string;
}) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => (value ? new Date(value) : new Date()));

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setViewMonth(value ? new Date(value) : new Date());
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className="flex h-10 w-full items-center gap-2 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors hover:border-accent focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <CalendarDays className="h-4 w-4 shrink-0 text-muted" />
          <span className={value ? "text-foreground" : "text-muted-foreground"}>
            {value ? formatDate(value) : placeholder}
          </span>
          {value && (
            <span
              role="button"
              tabIndex={0}
              aria-label={`Clear ${label.toLowerCase()}`}
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange("");
                }
              }}
              className="ml-auto rounded-full p-0.5 text-muted hover:bg-surface-muted hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent>
        <Calendar
          month={viewMonth}
          onMonthChange={setViewMonth}
          selected={value || undefined}
          minDate={minDate}
          maxDate={maxDate}
          onSelect={(key) => {
            onChange(key);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
