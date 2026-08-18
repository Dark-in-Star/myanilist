"use client";

import { useState } from "react";
import clsx from "clsx";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListSearchInput } from "@/components/ListSearchInput";

export function ListSearchBar({
  value,
  onChange,
  placeholder = "Search...",
  hideMobile = false,
  hideDesktop = false,
  mobileDockRight = true,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hideMobile?: boolean;
  hideDesktop?: boolean;
  mobileDockRight?: boolean;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {!hideDesktop && (
        <ListSearchInput
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="hidden sm:ml-auto sm:block sm:w-64"
        />
      )}

      {!hideMobile && (
        <div className={clsx(mobileDockRight && "ml-auto", "sm:hidden", mobileOpen && "w-full")}>
          {mobileOpen ? (
            <div className="flex w-full items-center gap-1">
              <ListSearchInput value={value} onChange={onChange} placeholder={placeholder} autoFocus className="flex-1" />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Close search"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={placeholder}
              onClick={() => setMobileOpen(true)}
              className="relative"
            >
              <Search className="h-4 w-4" />
              {value && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent" />}
            </Button>
          )}
        </div>
      )}
    </>
  );
}
