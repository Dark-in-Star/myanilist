import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { getAnimeRanking, getMangaRanking, searchAnime, searchManga } from "@/lib/api";
import {
  loadMoreAnimeRanking,
  loadMoreAnimeSearch,
  loadMoreMangaRanking,
  loadMoreMangaSearch,
} from "@/lib/browseActions";
import { toAnimeGridItem, toMangaGridItem } from "@/lib/gridItems";
import { getCachedGenres } from "@/lib/genreCache";
import { collectGenreFacets } from "@/lib/list-filters";
import { MediaLoadMoreGrid } from "@/components/MediaLoadMoreGrid";
import { RankingTabs } from "@/components/RankingTabs";
import { MediaTypeToggle } from "@/components/MediaTypeToggle";
import { GridSkeleton } from "@/components/GridSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { SearchBar } from "@/components/SearchBar";
import { ANIME_RANKING_TABS, MANGA_RANKING_TABS } from "@/lib/format";
import type { AnimeRankingType, Genre, MangaRankingType } from "@/lib/types";

export const metadata: Metadata = { title: "Browse" };

const PAGE_SIZE = 24;
// MAL's real cap on `limit` (verified live: 500 succeeds, 1000 is rejected as bad_request).
// The filter modal has no dedicated "list every genre" endpoint to call, so this fetches
// a wide sample of real MAL data (genres field only, to keep the payload small) and
// derives whichever genres actually turn up in it — the same ranking/search API already
// used for pagination, just with a much larger page just this once.
const GENRE_SAMPLE_LIMIT = 500;

function genresFromSample(nodes: { genres?: Genre[] }[]): Genre[] {
  return collectGenreFacets(nodes).map(({ id, name }) => ({ id, name }));
}

function isAnimeRankingType(value: string | undefined): value is AnimeRankingType {
  return ANIME_RANKING_TABS.some((tab) => tab.value === value);
}

function isMangaRankingType(value: string | undefined): value is MangaRankingType {
  return MANGA_RANKING_TABS.some((tab) => tab.value === value);
}

async function AnimeRankingResults({ type, rankingTabs }: { type: AnimeRankingType; rankingTabs: ReactNode }) {
  const [result, allGenres] = await Promise.all([
    getAnimeRanking(type, PAGE_SIZE),
    getCachedGenres(`anime-ranking-${type}`, async () => {
      const genrePool = await getAnimeRanking(type, GENRE_SAMPLE_LIMIT, "genres");
      return genresFromSample(genrePool.data.map(({ node }) => node));
    }),
  ]);
  const items = result.data.map(({ node, ranking }) => toAnimeGridItem(node, ranking.rank));

  return (
    <MediaLoadMoreGrid
      initialItems={items}
      initialHasMore={Boolean(result.paging?.next)}
      loadMoreAction={loadMoreAnimeRanking.bind(null, type)}
      pageSize={PAGE_SIZE}
      media="anime"
      toolbarStart={rankingTabs}
      allGenres={allGenres}
    />
  );
}

async function MangaRankingResults({ type, rankingTabs }: { type: MangaRankingType; rankingTabs: ReactNode }) {
  const [result, allGenres] = await Promise.all([
    getMangaRanking(type, PAGE_SIZE),
    getCachedGenres(`manga-ranking-${type}`, async () => {
      const genrePool = await getMangaRanking(type, GENRE_SAMPLE_LIMIT, "genres");
      return genresFromSample(genrePool.data.map(({ node }) => node));
    }),
  ]);
  const items = result.data.map(({ node, ranking }) => toMangaGridItem(node, ranking.rank));

  return (
    <MediaLoadMoreGrid
      initialItems={items}
      initialHasMore={Boolean(result.paging?.next)}
      loadMoreAction={loadMoreMangaRanking.bind(null, type)}
      pageSize={PAGE_SIZE}
      media="manga"
      toolbarStart={rankingTabs}
      allGenres={allGenres}
    />
  );
}

async function AnimeSearchResults({ q }: { q: string }) {
  const [result, allGenres] = await Promise.all([
    searchAnime(q, PAGE_SIZE),
    getCachedGenres(`anime-search-${q}`, async () => {
      const genrePool = await searchAnime(q, GENRE_SAMPLE_LIMIT, "genres");
      return genresFromSample(genrePool.data.map(({ node }) => node));
    }),
  ]);
  if (result.data.length === 0) {
    return <EmptyState title="No results found" description={`Nothing matched "${q}". Try a different search.`} />;
  }
  return (
    <MediaLoadMoreGrid
      initialItems={result.data.map(({ node }) => toAnimeGridItem(node))}
      initialHasMore={Boolean(result.paging?.next)}
      loadMoreAction={loadMoreAnimeSearch.bind(null, q)}
      pageSize={PAGE_SIZE}
      media="anime"
      allGenres={allGenres}
    />
  );
}

async function MangaSearchResults({ q }: { q: string }) {
  const [result, allGenres] = await Promise.all([
    searchManga(q, PAGE_SIZE),
    getCachedGenres(`manga-search-${q}`, async () => {
      const genrePool = await searchManga(q, GENRE_SAMPLE_LIMIT, "genres");
      return genresFromSample(genrePool.data.map(({ node }) => node));
    }),
  ]);
  if (result.data.length === 0) {
    return <EmptyState title="No results found" description={`Nothing matched "${q}". Try a different search.`} />;
  }
  return (
    <MediaLoadMoreGrid
      initialItems={result.data.map(({ node }) => toMangaGridItem(node))}
      initialHasMore={Boolean(result.paging?.next)}
      loadMoreAction={loadMoreMangaSearch.bind(null, q)}
      pageSize={PAGE_SIZE}
      media="manga"
      allGenres={allGenres}
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

  const heading = q ? `Results for "${q}"` : "Browse";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold sm:text-2xl">{heading}</h1>
          <MediaTypeToggle active={media} basePath="/browse" extraParams={q ? { q } : undefined} />
        </div>

        <Suspense fallback={<div className="ml-auto h-9 w-9 rounded-full bg-surface-muted sm:w-64" />}>
          <SearchBar mobileCollapse />
        </Suspense>
      </div>

      {q ? (
        <Suspense key={`search-${media}-${q}`} fallback={<GridSkeleton toolbar />}>
          {media === "manga" ? <MangaSearchResults q={q} /> : <AnimeSearchResults q={q} />}
        </Suspense>
      ) : (
        <Suspense key={`rank-${media}-${params.type ?? "all"}`} fallback={<GridSkeleton toolbar rankingTabs />}>
          {media === "manga" ? (
            <MangaRankingResults
              type={isMangaRankingType(params.type) ? params.type : "all"}
              rankingTabs={
                <RankingTabs
                  basePath="/browse"
                  tabs={MANGA_RANKING_TABS}
                  active={isMangaRankingType(params.type) ? params.type : "all"}
                  extraParams={{ media: "manga" }}
                />
              }
            />
          ) : (
            <AnimeRankingResults
              type={isAnimeRankingType(params.type) ? params.type : "all"}
              rankingTabs={
                <RankingTabs
                  basePath="/browse"
                  tabs={ANIME_RANKING_TABS}
                  active={isAnimeRankingType(params.type) ? params.type : "all"}
                  extraParams={{ media: "anime" }}
                />
              }
            />
          )}
        </Suspense>
      )}
    </div>
  );
}
