import type { Metadata } from "next";
import { Suspense } from "react";
import { getAnimeRanking, getMangaRanking, searchAnime, searchManga } from "@/lib/api";
import {
  loadMoreAnimeRanking,
  loadMoreAnimeSearch,
  loadMoreMangaRanking,
  loadMoreMangaSearch,
} from "@/lib/browseActions";
import { toAnimeGridItem, toMangaGridItem } from "@/lib/gridItems";
import { MediaLoadMoreGrid } from "@/components/MediaLoadMoreGrid";
import { RankingTabs } from "@/components/RankingTabs";
import { MediaTypeSelect } from "@/components/MediaTypeSelect";
import { GridSkeleton } from "@/components/GridSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { SearchBar } from "@/components/SearchBar";
import { ANIME_RANKING_TABS, MANGA_RANKING_TABS } from "@/lib/format";
import type { AnimeRankingType, MangaRankingType } from "@/lib/types";

export const metadata: Metadata = { title: "Browse" };

const PAGE_SIZE = 24;

function isAnimeRankingType(value: string | undefined): value is AnimeRankingType {
  return ANIME_RANKING_TABS.some((tab) => tab.value === value);
}

function isMangaRankingType(value: string | undefined): value is MangaRankingType {
  return MANGA_RANKING_TABS.some((tab) => tab.value === value);
}

async function AnimeRankingResults({ type }: { type: AnimeRankingType }) {
  const result = await getAnimeRanking(type, PAGE_SIZE);
  const items = result.data.map(({ node, ranking }) => toAnimeGridItem(node, ranking.rank));

  return (
    <MediaLoadMoreGrid
      initialItems={items}
      initialHasMore={Boolean(result.paging?.next)}
      loadMoreAction={loadMoreAnimeRanking.bind(null, type)}
      pageSize={PAGE_SIZE}
    />
  );
}

async function MangaRankingResults({ type }: { type: MangaRankingType }) {
  const result = await getMangaRanking(type, PAGE_SIZE);
  const items = result.data.map(({ node, ranking }) => toMangaGridItem(node, ranking.rank));

  return (
    <MediaLoadMoreGrid
      initialItems={items}
      initialHasMore={Boolean(result.paging?.next)}
      loadMoreAction={loadMoreMangaRanking.bind(null, type)}
      pageSize={PAGE_SIZE}
    />
  );
}

async function AnimeSearchResults({ q }: { q: string }) {
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

async function MangaSearchResults({ q }: { q: string }) {
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

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ media?: string; type?: string; q?: string }>;
}) {
  const params = await searchParams;
  const media: "anime" | "manga" = params.media === "manga" ? "manga" : "anime";
  const q = (params.q ?? "").trim();

  const heading = q ? `Results for "${q}"` : media === "manga" ? "Manga Rankings" : "Anime Rankings";

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-bold sm:text-2xl">{heading}</h1>

      <div className="max-w-md">
        <Suspense fallback={<div className="h-9 w-full rounded-full bg-surface-muted" />}>
          <SearchBar />
        </Suspense>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <MediaTypeSelect active={media} extraParams={q ? { q } : undefined} />
        {!q &&
          (media === "manga" ? (
            <RankingTabs
              basePath="/browse"
              tabs={MANGA_RANKING_TABS}
              active={isMangaRankingType(params.type) ? params.type : "all"}
              extraParams={{ media: "manga" }}
            />
          ) : (
            <RankingTabs
              basePath="/browse"
              tabs={ANIME_RANKING_TABS}
              active={isAnimeRankingType(params.type) ? params.type : "all"}
              extraParams={{ media: "anime" }}
            />
          ))}
      </div>

      {q ? (
        <Suspense key={`search-${media}-${q}`} fallback={<GridSkeleton />}>
          {media === "manga" ? <MangaSearchResults q={q} /> : <AnimeSearchResults q={q} />}
        </Suspense>
      ) : (
        <Suspense key={`rank-${media}-${params.type ?? "all"}`} fallback={<GridSkeleton />}>
          {media === "manga" ? (
            <MangaRankingResults type={isMangaRankingType(params.type) ? params.type : "all"} />
          ) : (
            <AnimeRankingResults type={isAnimeRankingType(params.type) ? params.type : "all"} />
          )}
        </Suspense>
      )}
    </div>
  );
}
