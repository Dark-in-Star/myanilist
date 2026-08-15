"use client";

import { useState, useTransition } from "react";
import { MediaCard } from "./MediaCard";
import { MediaGrid } from "./MediaGrid";
import type { GridItem } from "@/lib/gridItems";
import type { LoadMoreResult } from "@/lib/browseActions";

export function MediaLoadMoreGrid({
  initialItems,
  initialHasMore,
  loadMoreAction,
  pageSize,
}: {
  initialItems: GridItem[];
  initialHasMore: boolean;
  loadMoreAction: (offset: number, limit: number) => Promise<LoadMoreResult>;
  pageSize: number;
}) {
  const [items, setItems] = useState(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isPending, startTransition] = useTransition();

  function handleLoadMore() {
    startTransition(async () => {
      const result = await loadMoreAction(items.length, pageSize);
      setItems((prev) => [...prev, ...result.items]);
      setHasMore(result.hasMore);
    });
  }

  return (
    <>
      <MediaGrid>
        {items.map((item) => (
          <MediaCard
            key={item.id}
            href={item.href}
            title={item.title}
            imageUrl={item.imageUrl}
            mean={item.mean}
            mediaType={item.mediaType}
            rank={item.rank}
          />
        ))}
      </MediaGrid>
      {hasMore && (
        <div className="flex justify-center py-6">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isPending}
            className="rounded-full border border-border/60 bg-surface px-6 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:text-accent hover:shadow-md active:translate-y-0 disabled:pointer-events-none disabled:opacity-60"
          >
            {isPending ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </>
  );
}
