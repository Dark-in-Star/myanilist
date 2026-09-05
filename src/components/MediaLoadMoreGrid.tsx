"use client";

import { useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import { MediaCard } from "./MediaCard";
import { MediaGrid } from "./MediaGrid";
import { EmptyState } from "./EmptyState";
import { ListFilterButton } from "./ListFilterButton";
import type { GridItem } from "@/lib/gridItems";
import type { LoadMoreResult } from "@/lib/browseActions";
import { matchesListFilters } from "@/lib/list-filters";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setBrowseFilters } from "@/lib/store/browseFiltersSlice";
import type { ListMedia } from "@/lib/store/listFiltersSlice";
import type { Genre } from "@/lib/types";
import { Button } from "@/components/ui/button";

// MAL's ranking/search endpoints don't accept a genre/rating/date filter — filtering only
// ever happens client-side over pages already fetched. Without this, picking a genre that
// isn't on the current page (a near-certainty with ~80 genres and a 24-item page) looks
// like "no matches", or shows only a handful of results, even though MAL has plenty
// further in the same ranking/search. So while fewer than `resultTarget` matches have
// turned up, keep auto-loading pages until the target is met, the ranking/search truly
// runs out (hasMore goes false), or SEARCH_TIMEOUT_MS elapses without reaching it — each
// search attempt (initial or a "Load more" click, which raises the target by another
// batch: 12, then 24, then 36, ...) gets its own fresh time budget.
const RESULT_BATCH = 12;
const SEARCH_TIMEOUT_MS = 30_000;

export function MediaLoadMoreGrid({
  initialItems,
  initialHasMore,
  loadMoreAction,
  pageSize,
  media,
  toolbarStart,
  allGenres,
}: {
  initialItems: GridItem[];
  initialHasMore: boolean;
  loadMoreAction: (offset: number, limit: number) => Promise<LoadMoreResult>;
  pageSize: number;
  media: ListMedia;
  toolbarStart?: ReactNode;
  allGenres?: Genre[];
}) {
  const [items, setItems] = useState(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isPending, startTransition] = useTransition();
  const [resultTarget, setResultTarget] = useState(RESULT_BATCH);
  const dispatch = useAppDispatch();
  const filters = useAppSelector((s) => s.browseFilters[media]);

  function handleLoadMore() {
    startTransition(async () => {
      const result = await loadMoreAction(items.length, pageSize);
      setItems((prev) => [...prev, ...result.items]);
      setHasMore(result.hasMore);
    });
  }

  const filtered = useMemo(
    () =>
      items.filter((item) =>
        matchesListFilters({ genres: item.genres, mean: item.mean, start_date: item.startDate }, filters),
      ),
    [items, filters],
  );

  // Each search attempt (a filter change or a "Load more" click, both of which move
  // resultTarget) gets its own fresh SEARCH_TIMEOUT_MS budget via a real timer — avoids
  // impure Date.now()-based deadline math during render.
  const [searchTimedOut, setSearchTimedOut] = useState(false);

  // A fresh filter selection gets a fresh target and a fresh timeout budget.
  const [prevFilters, setPrevFilters] = useState(filters);
  if (filters !== prevFilters) {
    setPrevFilters(filters);
    setResultTarget(RESULT_BATCH);
    setSearchTimedOut(false);
  }

  const wantsToSearch = filtered.length < resultTarget && items.length > 0 && hasMore;

  useEffect(() => {
    if (!wantsToSearch || searchTimedOut) return;
    const timer = setTimeout(() => setSearchTimedOut(true), SEARCH_TIMEOUT_MS);
    return () => clearTimeout(timer);
    // Re-arms whenever a new search session starts (target or filters change), or once
    // wantsToSearch itself flips (e.g. satisfied mid-session) so a stale timer is cleared.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultTarget, filters, wantsToSearch]);

  const isAutoSearching = wantsToSearch && !searchTimedOut;

  useEffect(() => {
    if (!isAutoSearching || isPending) return;
    handleLoadMore();
    // handleLoadMore reads current items/hasMore via closure each call; re-running on
    // every relevant state change (not just mount) is exactly what an auto-search loop needs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAutoSearching, isPending]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">{toolbarStart}</div>
        <ListFilterButton
          nodes={items.map((item) => ({ genres: item.genres, mean: item.mean, start_date: item.startDate }))}
          allGenres={allGenres}
          filters={filters}
          onChange={(value) => dispatch(setBrowseFilters({ media, filters: value }))}
        />
      </div>

      {filtered.length === 0 ? (
        isAutoSearching || (isPending && items.length > 0) ? (
          <EmptyState title="Searching…" description="Looking further through the results for a match." />
        ) : (
          <EmptyState title="No matches" description="Try adjusting or clearing your filters." />
        )
      ) : (
        <MediaGrid>
          {filtered.map((item) => (
            <MediaCard
              key={item.id}
              id={item.id}
              media={media}
              href={item.href}
              title={item.title}
              imageUrl={item.imageUrl}
              mean={item.mean}
              genres={item.genres}
              mediaType={item.mediaType}
              rank={item.rank}
              listStatus={item.listStatus}
            />
          ))}
        </MediaGrid>
      )}

      {isAutoSearching && filtered.length > 0 && (
        <p className="text-center text-sm text-muted">Looking for more matches…</p>
      )}

      {hasMore && !isAutoSearching && (
        <div className="flex justify-center py-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setResultTarget(filtered.length + RESULT_BATCH);
              setSearchTimedOut(false);
            }}
            disabled={isPending}
            className="h-auto rounded-full border-border/60 px-6 py-2.5 text-sm font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:text-accent hover:shadow-md active:translate-y-0 disabled:pointer-events-none disabled:opacity-60"
          >
            {isPending ? "Loading…" : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}
