import { MediaCardSkeleton } from "./MediaCardSkeleton";
import { MediaGrid } from "./MediaGrid";

export function GridSkeleton({
  count = 24,
  toolbar = false,
  rankingTabs = false,
}: {
  count?: number;
  /** Matches MediaLoadMoreGrid's own toolbar row (always renders a Filter button) so real content doesn't pop in above the grid once it loads. */
  toolbar?: boolean;
  /** Adds the ranking-type select skeleton on the toolbar's left side. */
  rankingTabs?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      {toolbar && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>{rankingTabs && <div className="h-9 w-40 animate-pulse rounded-lg bg-surface-muted" />}</div>
          <div className="h-9 w-24 animate-pulse rounded-lg bg-surface-muted" />
        </div>
      )}

      <MediaGrid>
        {Array.from({ length: count }).map((_, i) => (
          <MediaCardSkeleton key={i} />
        ))}
      </MediaGrid>
    </div>
  );
}
