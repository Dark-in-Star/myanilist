import { GridSkeleton } from "@/components/GridSkeleton";

export default function BrowseLoading() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="h-7 w-24 animate-pulse rounded bg-surface-muted sm:h-8" />
          <div className="h-9 w-32 animate-pulse rounded-full bg-surface-muted" />
        </div>
        <div className="ml-auto hidden h-9 w-64 animate-pulse rounded-full bg-surface-muted sm:block" />
      </div>

      <GridSkeleton toolbar rankingTabs />
    </div>
  );
}
