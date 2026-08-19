export function MediaCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-surface shadow-sm">
      <div className="aspect-[2/3] w-full animate-pulse bg-surface-muted" />
      <div className="flex flex-1 flex-col gap-1 p-3">
        <div className="flex min-h-10 flex-col justify-center gap-1.5">
          <div className="h-3.5 w-full animate-pulse rounded bg-surface-muted" />
          <div className="h-3.5 w-3/4 animate-pulse rounded bg-surface-muted" />
        </div>
        <div className="mt-auto h-3 w-1/3 animate-pulse rounded bg-surface-muted" />
      </div>
    </div>
  );
}
