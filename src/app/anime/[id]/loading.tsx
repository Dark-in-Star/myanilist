import { RowSkeleton } from "@/components/RowSkeleton";

function InfoRowSkeleton() {
  return (
    <div className="flex flex-col gap-1.5 py-2.5">
      <div className="h-2.5 w-16 animate-pulse rounded bg-surface-muted" />
      <div className="h-3.5 w-24 animate-pulse rounded bg-surface-muted" />
    </div>
  );
}

function PersonCardSkeleton() {
  return (
    <div className="flex h-full flex-col items-center gap-3 rounded-xl border border-border bg-surface p-3">
      <div className="h-24 w-20 animate-pulse rounded-lg bg-surface-muted" />
      <div className="flex w-full flex-col items-center gap-1.5">
        <div className="h-3.5 w-4/5 animate-pulse rounded bg-surface-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-surface-muted" />
      </div>
    </div>
  );
}

function PersonRowSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="h-6 w-24 animate-pulse rounded bg-surface-muted" />
      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1 sm:gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="w-32.5 shrink-0 sm:w-40 md:w-45">
            <PersonCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnimeDetailLoading() {
  return (
    <div className="flex flex-col gap-8">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex flex-col gap-6 p-4 sm:p-6 md:flex-row">
          <div className="mx-auto w-40 shrink-0 sm:w-52 md:mx-0">
            <div className="aspect-[2/3] w-full animate-pulse rounded-xl border border-border bg-surface-muted shadow-lg" />
          </div>

          <div className="flex flex-1 flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="h-8 w-3/4 animate-pulse rounded bg-surface-muted sm:h-9" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-surface-muted" />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="h-9 w-20 animate-pulse rounded-xl bg-surface-muted" />
              <div className="h-9 w-24 animate-pulse rounded-lg bg-surface-muted" />
              <div className="h-9 w-28 animate-pulse rounded-lg bg-surface-muted" />
              <div className="h-9 w-24 animate-pulse rounded-lg bg-surface-muted" />
            </div>

            <div className="h-4 w-2/3 animate-pulse rounded bg-surface-muted" />

            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-6 w-16 animate-pulse rounded-full bg-surface-muted" />
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="h-9 w-32 animate-pulse rounded-lg bg-surface-muted" />
              <div className="h-9 w-44 animate-pulse rounded-lg bg-surface-muted" />
            </div>

            <div className="flex max-w-3xl flex-col gap-2">
              <div className="h-3.5 w-full animate-pulse rounded bg-surface-muted" />
              <div className="h-3.5 w-full animate-pulse rounded bg-surface-muted" />
              <div className="h-3.5 w-5/6 animate-pulse rounded bg-surface-muted" />
              <div className="h-3.5 w-2/3 animate-pulse rounded bg-surface-muted" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
        <aside className="flex min-w-0 flex-col gap-4">
          <div className="h-40 animate-pulse rounded-xl border border-border bg-surface" />

          <div className="flex flex-col gap-2">
            <div className="h-3 w-16 animate-pulse rounded bg-surface-muted" />
            <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-surface">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-4 py-2.5">
                  <div className="h-3.5 w-40 animate-pulse rounded bg-surface-muted" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-surface px-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <InfoRowSkeleton key={i} />
            ))}
          </div>
        </aside>

        <div className="flex min-w-0 flex-col gap-8">
          <div className="flex flex-col gap-3">
            <div className="h-6 w-20 animate-pulse rounded bg-surface-muted" />
            <div className="aspect-video w-full animate-pulse rounded-2xl border border-border bg-surface-muted" />
          </div>

          <PersonRowSkeleton />
          <PersonRowSkeleton />
        </div>
      </div>

      <RowSkeleton viewAll={false} />
    </div>
  );
}
