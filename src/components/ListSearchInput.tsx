"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function ListSearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className,
  autoFocus,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}) {
  return (
    <div className={cn("relative w-full", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        autoFocus={autoFocus}
        className="h-9 w-full rounded-full border border-border bg-surface-muted pl-9 pr-8 text-sm outline-none transition-colors placeholder:text-muted focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted transition-colors hover:bg-surface hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
