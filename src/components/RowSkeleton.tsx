import { MediaCardSkeleton } from "./MediaCardSkeleton";

export function RowSkeleton({ viewAll = true }: { viewAll?: boolean }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="h-6 w-40 animate-pulse rounded bg-surface-muted sm:h-7" />
        <div className="flex items-center gap-2">
          {viewAll && <div className="h-4 w-16 animate-pulse rounded bg-surface-muted" />}
          <div className="hidden items-center gap-1.5 sm:flex">
            <div className="h-8 w-8 animate-pulse rounded-full border border-border/60 bg-surface-muted" />
            <div className="h-8 w-8 animate-pulse rounded-full border border-border/60 bg-surface-muted" />
          </div>
        </div>
      </div>
      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1 sm:gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="w-32.5 shrink-0 sm:w-40 md:w-45">
            <MediaCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}
