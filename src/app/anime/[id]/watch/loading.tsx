export default function WatchAnimeLoading() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="h-4 w-32 animate-pulse rounded bg-surface-muted" />

      <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4">
        <div className="aspect-[2/3] w-16 shrink-0 animate-pulse rounded-lg border border-border bg-surface-muted" />
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="h-5 w-3/5 animate-pulse rounded bg-surface-muted" />
          <div className="h-3.5 w-4/5 animate-pulse rounded bg-surface-muted" />
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface px-4 py-8">
        <div className="h-3.5 w-40 animate-pulse rounded bg-surface-muted" />
        <div className="h-9 w-32 animate-pulse rounded-lg bg-surface-muted" />
      </div>

      <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-surface">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-3 px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="size-5 shrink-0 animate-pulse rounded bg-surface-muted" />
              <div className="h-3.5 w-32 animate-pulse rounded bg-surface-muted" />
            </div>
            <div className="size-3.5 shrink-0 animate-pulse rounded bg-surface-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
