"use client";

import { Suspense, useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/SearchBar";

export function MobileSearchToggle() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label="Search"
        aria-expanded={open}
        className="rounded-full sm:hidden"
      >
        <Search className="h-5 w-5" />
      </Button>

      {open && (
        <div className="absolute inset-0 z-20 flex items-center gap-2 border-b border-border/60 bg-surface/75 px-3 backdrop-blur-xl sm:hidden">
          <div className="min-w-0 flex-1">
            <Suspense fallback={<div className="h-9 w-full rounded-full bg-surface-muted" />}>
              <SearchBar autoFocus onNavigate={() => setOpen(false)} />
            </Suspense>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            aria-label="Close search"
            className="shrink-0 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}
    </>
  );
}
