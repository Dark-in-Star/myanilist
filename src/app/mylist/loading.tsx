function ListRowSkeleton() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-surface p-3 sm:gap-4">
      <div className="h-20 w-14 shrink-0 animate-pulse rounded-lg bg-surface-muted sm:h-24 sm:w-16" />

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-col gap-1.5">
          <div className="h-4 w-3/4 animate-pulse rounded bg-surface-muted" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-surface-muted" />
        </div>

        <div className="h-3 w-32 animate-pulse rounded bg-surface-muted" />

        <div className="flex gap-1">
          <div className="h-4 w-12 animate-pulse rounded-full bg-surface-muted" />
          <div className="h-4 w-14 animate-pulse rounded-full bg-surface-muted" />
          <div className="h-4 w-10 animate-pulse rounded-full bg-surface-muted" />
        </div>

        <div className="flex gap-2">
          <div className="h-4 w-12 animate-pulse rounded-md bg-surface-muted" />
          <div className="h-4 w-12 animate-pulse rounded-md bg-surface-muted" />
        </div>

        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 animate-pulse rounded-full bg-surface-muted" />
          <div className="h-3 w-14 shrink-0 animate-pulse rounded bg-surface-muted" />
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-2">
        <div className="size-7 animate-pulse rounded-lg bg-surface-muted" />
        <div className="size-7 animate-pulse rounded-lg bg-surface-muted" />
      </div>
    </div>
  );
}

export default function MyListLoading() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <div className="h-7 w-40 animate-pulse rounded bg-surface-muted sm:h-8" />
        <div className="h-9 w-32 animate-pulse rounded-full bg-surface-muted" />
      </div>

      <div className="flex gap-4 overflow-hidden border-b border-border pb-2.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-4 w-16 shrink-0 animate-pulse rounded bg-surface-muted" />
        ))}
      </div>

      <div className="flex gap-2">
        <div className="h-8 w-24 animate-pulse rounded-lg bg-surface-muted" />
        <div className="h-8 w-28 animate-pulse rounded-lg bg-surface-muted" />
      </div>

      <div className="flex flex-col gap-2.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <ListRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
