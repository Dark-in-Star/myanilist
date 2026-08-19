import { RowSkeleton } from "@/components/RowSkeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-10">
      <section className="relative overflow-hidden rounded-2xl border border-border">
        <div className="relative aspect-1774/887 min-h-95 w-full animate-pulse bg-surface-muted sm:min-h-115">
          <div className="absolute inset-x-0 top-[81%] flex justify-center px-4">
            <div className="h-9 w-full max-w-md animate-pulse rounded-full bg-surface" />
          </div>
        </div>
      </section>

      <RowSkeleton />
      <RowSkeleton />
      <RowSkeleton />
      <RowSkeleton />
      <RowSkeleton />
    </div>
  );
}
