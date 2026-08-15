import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import clsx from "clsx";
import { searchAnime, searchManga } from "@/lib/api";
import { loadMoreAnimeSearch, loadMoreMangaSearch } from "@/lib/browseActions";
import { toAnimeGridItem, toMangaGridItem } from "@/lib/gridItems";
import { MediaLoadMoreGrid } from "@/components/MediaLoadMoreGrid";
import { GridSkeleton } from "@/components/GridSkeleton";
import { EmptyState } from "@/components/EmptyState";

export const metadata: Metadata = { title: "Search" };

const PAGE_SIZE = 24;
type MediaKind = "anime" | "manga";

async function SearchResults({ q, kind }: { q: string; kind: MediaKind }) {
  if (kind === "anime") {
    const result = await searchAnime(q, PAGE_SIZE);
    if (result.data.length === 0) {
      return <EmptyState title="No results found" description={`Nothing matched "${q}". Try a different search.`} />;
    }
    return (
      <MediaLoadMoreGrid
        initialItems={result.data.map(({ node }) => toAnimeGridItem(node))}
        initialHasMore={Boolean(result.paging?.next)}
        loadMoreAction={loadMoreAnimeSearch.bind(null, q)}
        pageSize={PAGE_SIZE}
      />
    );
  }

  const result = await searchManga(q, PAGE_SIZE);
  if (result.data.length === 0) {
    return <EmptyState title="No results found" description={`Nothing matched "${q}". Try a different search.`} />;
  }
  return (
    <MediaLoadMoreGrid
      initialItems={result.data.map(({ node }) => toMangaGridItem(node))}
      initialHasMore={Boolean(result.paging?.next)}
      loadMoreAction={loadMoreMangaSearch.bind(null, q)}
      pageSize={PAGE_SIZE}
    />
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const kind: MediaKind = params.type === "manga" ? "manga" : "anime";

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-bold sm:text-2xl">{q ? `Results for "${q}"` : "Search"}</h1>

      <div className="flex gap-2">
        {(["anime", "manga"] as const).map((tab) => (
          <Link
            key={tab}
            href={`/search?q=${encodeURIComponent(q)}&type=${tab}`}
            className={clsx(
              "rounded-full border px-4 py-1.5 text-sm font-medium capitalize",
              tab === kind
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-surface text-muted hover:border-accent hover:text-accent",
            )}
          >
            {tab}
          </Link>
        ))}
      </div>

      {!q ? (
        <EmptyState title="Search for anime or manga" description="Use the search bar above to get started." />
      ) : (
        <Suspense key={`${kind}-${q}`} fallback={<GridSkeleton />}>
          <SearchResults q={q} kind={kind} />
        </Suspense>
      )}
    </div>
  );
}
