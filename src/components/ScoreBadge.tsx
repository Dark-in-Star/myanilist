import { formatScore } from "@/lib/format";

export function ScoreBadge({ mean, size = "sm" }: { mean?: number; size?: "sm" | "lg" }) {
  const hasScore = mean !== undefined;
  return (
    <span
      className={
        size === "lg"
          ? "inline-flex items-center gap-1.5 rounded-xl border border-border/60 bg-linear-to-br from-surface-muted to-surface px-3 py-1.5 text-lg font-bold text-score shadow-sm"
          : "inline-flex items-center gap-1 rounded-md bg-overlay px-1.5 py-0.5 text-xs font-semibold text-overlay-foreground"
      }
    >
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={size === "lg" ? "h-4 w-4" : "h-3 w-3"}
        aria-hidden="true"
      >
        <path d="M10 1.5l2.6 5.75 6.15.6-4.65 4.2 1.35 6.05L10 15.05l-5.45 3.05 1.35-6.05L1.25 7.85l6.15-.6L10 1.5z" />
      </svg>
      {hasScore ? formatScore(mean) : "N/A"}
    </span>
  );
}
