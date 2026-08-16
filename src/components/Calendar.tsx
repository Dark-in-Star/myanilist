"use client";

import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toDateKey } from "@/lib/format";

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// MAL's earliest listed anime dates to 1917 (see SeasonPickerModal); the upper
// bound leaves room for already-announced upcoming releases.
const EARLIEST_YEAR = 1917;

function getMonthGrid(year: number, month: number): (Date | null)[] {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = Array.from({ length: firstWeekday }, () => null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month, day));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function Calendar({
  month,
  onMonthChange,
  selected,
  onSelect,
  minDate,
  maxDate,
}: {
  month: Date;
  onMonthChange: (month: Date) => void;
  selected?: string;
  onSelect: (dateKey: string) => void;
  minDate?: string;
  maxDate?: string;
}) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const cells = getMonthGrid(year, monthIndex);
  const todayKey = toDateKey(new Date());
  const latestYear = new Date().getFullYear() + 1;
  const yearOptions = Array.from({ length: latestYear - EARLIEST_YEAR + 1 }, (_, i) => latestYear - i);

  return (
    <div className="flex w-64 flex-col gap-2">
      <div className="flex items-center justify-between gap-1">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => onMonthChange(new Date(year, monthIndex - 1, 1))}
          className="rounded-md p-1 text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-1">
          <select
            aria-label="Month"
            value={monthIndex}
            onChange={(e) => onMonthChange(new Date(year, Number(e.target.value), 1))}
            className="rounded-md border-none bg-transparent py-0.5 text-sm font-semibold text-foreground outline-none hover:bg-surface-muted"
          >
            {MONTH_LABELS.map((label, i) => (
              <option key={label} value={i}>
                {label}
              </option>
            ))}
          </select>
          <select
            aria-label="Year"
            value={year}
            onChange={(e) => onMonthChange(new Date(Number(e.target.value), monthIndex, 1))}
            className="rounded-md border-none bg-transparent py-0.5 text-sm font-semibold text-foreground outline-none hover:bg-surface-muted"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          aria-label="Next month"
          onClick={() => onMonthChange(new Date(year, monthIndex + 1, 1))}
          className="rounded-md p-1 text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className="text-xs font-medium text-muted">
            {label}
          </span>
        ))}

        {cells.map((date, i) => {
          if (!date) return <span key={i} />;
          const key = toDateKey(date);
          const disabled = (minDate && key < minDate) || (maxDate && key > maxDate);
          const isSelected = key === selected;
          const isToday = key === todayKey;
          return (
            <button
              key={key}
              type="button"
              disabled={Boolean(disabled)}
              onClick={() => onSelect(key)}
              className={clsx(
                "mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors",
                isSelected
                  ? "bg-accent font-semibold text-accent-foreground"
                  : disabled
                    ? "pointer-events-none text-muted/40"
                    : isToday
                      ? "font-semibold text-accent hover:bg-accent-soft"
                      : "text-foreground hover:bg-surface-muted",
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
