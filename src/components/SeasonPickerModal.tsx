"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SEASON_ORDER, formatSeasonLabel, getCurrentAnimeSeason } from "@/lib/format";
import type { AnimeSeason } from "@/lib/types";

// MAL's earliest listed anime dates to 1917; the upper bound leaves room for
// "upcoming" seasons a year out.
const EARLIEST_YEAR = 1917;

export function SeasonPickerModal({ year, season }: { year: number; season: AnimeSeason }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pendingYear, setPendingYear] = useState(String(year));
  const [pendingSeason, setPendingSeason] = useState<AnimeSeason>(season);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setPendingYear(String(year));
      setPendingSeason(season);
    }
  }

  function handleApply() {
    const parsedYear = Number(pendingYear);
    if (!Number.isInteger(parsedYear)) return;
    router.push(`/archive?year=${parsedYear}&season=${pendingSeason}`);
    setOpen(false);
  }

  const latestYear = getCurrentAnimeSeason().year + 1;
  const yearOptions = Array.from({ length: latestYear - EARLIEST_YEAR + 1 }, (_, i) => latestYear - i);
  const isValidYear = yearOptions.includes(Number(pendingYear));

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-base font-bold text-foreground transition-colors hover:text-accent sm:text-lg"
        >
          {formatSeasonLabel(season)} {year}
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
            className="h-4 w-4 opacity-60"
          >
            <rect x="3" y="4" width="14" height="13" rx="2" />
            <path strokeLinecap="round" d="M3 8h14M7 2v4M13 2v4" />
          </svg>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Jump to a season</DialogTitle>
          <DialogDescription>Pick a year and season to browse.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="archive-year">Year</Label>
            <Select value={pendingYear} onValueChange={setPendingYear}>
              <SelectTrigger id="archive-year" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Season</Label>
            <div className="flex flex-wrap gap-2">
              {SEASON_ORDER.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setPendingSeason(s)}
                  className={clsx(
                    "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200",
                    s === pendingSeason
                      ? "border-accent bg-accent text-accent-foreground shadow-sm shadow-accent/30"
                      : "border-border/60 bg-surface text-muted hover:-translate-y-0.5 hover:border-accent hover:text-accent",
                  )}
                >
                  {formatSeasonLabel(s)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" onClick={handleApply} disabled={!isValidYear}>
            Go
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
