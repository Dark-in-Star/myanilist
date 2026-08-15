export function RowSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="h-6 w-40 animate-pulse rounded bg-surface-muted" />
      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1 sm:gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="w-[130px] shrink-0 sm:w-[160px] md:w-[180px]">
            <div className="aspect-[2/3] w-full animate-pulse rounded-xl bg-surface-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
