import { GridSkeleton } from "@/components/GridSkeleton";

export default function ArchiveLoading() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <div className="h-7 w-40 animate-pulse rounded bg-surface-muted sm:h-8" />
        <div className="h-4 w-72 max-w-full animate-pulse rounded bg-surface-muted" />
      </div>

      <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-surface p-3 shadow-sm sm:p-4">
        <div className="h-4 w-20 animate-pulse rounded bg-surface-muted" />
        <div className="h-6 w-32 animate-pulse rounded bg-surface-muted" />
        <div className="h-4 w-20 animate-pulse rounded bg-surface-muted" />
      </div>

      <GridSkeleton toolbar />
    </div>
  );
}
