import { MediaGrid } from "./MediaGrid";

export function GridSkeleton({ count = 18 }: { count?: number }) {
  return (
    <MediaGrid>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface">
          <div className="aspect-[2/3] w-full animate-pulse bg-surface-muted" />
          <div className="flex flex-col gap-2 p-2.5">
            <div className="h-3.5 w-full animate-pulse rounded bg-surface-muted" />
            <div className="h-3.5 w-2/3 animate-pulse rounded bg-surface-muted" />
          </div>
        </div>
      ))}
    </MediaGrid>
  );
}
