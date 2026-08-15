import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import clsx from "clsx";
import { searchAnime, searchManga } from "@/lib/api";
import { MediaCard } from "@/components/MediaCard";
import { MediaGrid } from "@/components/MediaGrid";
import { GridSkeleton } from "@/components/GridSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { LoadMoreLink } from "@/components/LoadMoreLink";

export const metadata: Metadata = { title: "Search" };

const PAGE_SIZE = 24;
type MediaKind = "anime" | "manga";

async function SearchResults({ q, kind, limit }: { q: string; kind: MediaKind; limit: number }) {
  const result = kind === "anime" ? await searchAnime(q, limit) : await searchManga(q, limit);

  if (result.data.length === 0) {
    return <EmptyState title="No results found" description={`Nothing matched "${q}". Try a different search.`} />;
  }

  return (
    <>
      <MediaGrid>
        {result.data.map(({ node }) => (
          <MediaCard
            key={node.id}
            href={`/${kind}/${node.id}`}
            title={node.title}
            imageUrl={node.main_picture?.large ?? node.main_picture?.medium}
            mean={node.mean}
            mediaType={node.media_type}
          />
        ))}
      </MediaGrid>
      <LoadMoreLink
        href={`/search?q=${encodeURIComponent(q)}&type=${kind}&limit=${limit + PAGE_SIZE}`}
        hasMore={Boolean(result.paging?.next)}
      />
    </>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; limit?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const kind: MediaKind = params.type === "manga" ? "manga" : "anime";
  const limit = Math.min(Number(params.limit) || PAGE_SIZE, 100);

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
        <Suspense key={`${kind}-${q}-${limit}`} fallback={<GridSkeleton />}>
          <SearchResults q={q} kind={kind} limit={limit} />
        </Suspense>
      )}
    </div>
  );
}
