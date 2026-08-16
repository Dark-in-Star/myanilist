"use client";

export function RangeSlider({
  min,
  max,
  step,
  valueMin,
  valueMax,
  onChange,
  formatValue = String,
}: {
  min: number;
  max: number;
  step: number;
  valueMin: number;
  valueMax: number;
  onChange: (min: number, max: number) => void;
  formatValue?: (value: number) => string;
}) {
  const toPercent = (value: number) => ((value - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-sm font-semibold text-foreground">
        <span>{formatValue(valueMin)}</span>
        <span>{formatValue(valueMax)}</span>
      </div>

      <div className="relative h-4">
        <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-surface-muted" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-accent"
          style={{ left: `${toPercent(valueMin)}%`, right: `${100 - toPercent(valueMax)}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMin}
          onChange={(e) => onChange(Math.min(Number(e.target.value), valueMax), valueMax)}
          aria-label="Minimum"
          className="range-slider absolute inset-0 h-4 w-full"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMax}
          onChange={(e) => onChange(valueMin, Math.max(Number(e.target.value), valueMin))}
          aria-label="Maximum"
          className="range-slider absolute inset-0 h-4 w-full"
        />
      </div>
    </div>
  );
}
