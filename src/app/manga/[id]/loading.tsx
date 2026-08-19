import { RowSkeleton } from "@/components/RowSkeleton";

function InfoRowSkeleton() {
  return (
    <div className="flex flex-col gap-1.5 py-2.5">
      <div className="h-2.5 w-16 animate-pulse rounded bg-surface-muted" />
      <div className="h-3.5 w-24 animate-pulse rounded bg-surface-muted" />
    </div>
  );
}

export default function MangaDetailLoading() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="mx-auto w-40 shrink-0 sm:w-52 md:mx-0">
          <div className="aspect-[2/3] w-full animate-pulse rounded-xl border border-border bg-surface-muted" />
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

          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-6 w-16 animate-pulse rounded-full bg-surface-muted" />
            ))}
          </div>

          <div className="flex max-w-3xl flex-col gap-2">
            <div className="h-3.5 w-full animate-pulse rounded bg-surface-muted" />
            <div className="h-3.5 w-full animate-pulse rounded bg-surface-muted" />
            <div className="h-3.5 w-5/6 animate-pulse rounded bg-surface-muted" />
            <div className="h-3.5 w-2/3 animate-pulse rounded bg-surface-muted" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="order-2 flex flex-col gap-4 lg:order-1">
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
            <div className="h-4 w-28 animate-pulse rounded bg-surface-muted" />
            <div className="h-9 w-full animate-pulse rounded-lg bg-surface-muted" />
            <div className="grid grid-cols-3 gap-3">
              <div className="h-9 w-full animate-pulse rounded-lg bg-surface-muted" />
              <div className="h-9 w-full animate-pulse rounded-lg bg-surface-muted" />
              <div className="h-9 w-full animate-pulse rounded-lg bg-surface-muted" />
            </div>
          </div>

          <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-surface px-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <InfoRowSkeleton key={i} />
            ))}
          </div>
        </aside>

        <div className="order-1 flex flex-col gap-8 lg:order-2">
          <RowSkeleton viewAll={false} />
          <RowSkeleton viewAll={false} />
        </div>
      </div>
    </div>
  );
}
