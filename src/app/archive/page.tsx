import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getSeasonalAnime } from "@/lib/api";
import { loadMoreSeasonalAnime } from "@/lib/browseActions";
import { getCachedGenres } from "@/lib/genreCache";
import { toAnimeGridItem } from "@/lib/gridItems";
import { collectGenreFacets } from "@/lib/list-filters";
import { MediaLoadMoreGrid } from "@/components/MediaLoadMoreGrid";
import { GridSkeleton } from "@/components/GridSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { SeasonPickerModal } from "@/components/SeasonPickerModal";
import { formatSeasonLabel, getCurrentAnimeSeason, isAnimeSeason, shiftSeason } from "@/lib/format";
import type { AnimeSeason } from "@/lib/types";

export const metadata: Metadata = { title: "Archive" };

const PAGE_SIZE = 24;
// MAL's real cap on `limit` (verified live against /anime/season: 500 succeeds).
const GENRE_SAMPLE_LIMIT = 500;

async function SeasonResults({ year, season }: { year: number; season: AnimeSeason }) {
  const [result, allGenres] = await Promise.all([
    getSeasonalAnime(year, season, "anime_num_list_users", PAGE_SIZE),
    getCachedGenres(`anime-season-${year}-${season}`, async () => {
      const genrePool = await getSeasonalAnime(year, season, "anime_num_list_users", GENRE_SAMPLE_LIMIT, "genres");
      return collectGenreFacets(genrePool.data.map(({ node }) => node)).map(({ id, name }) => ({ id, name }));
    }),
  ]);

  if (result.data.length === 0) {
    return (
      <EmptyState
        title="Nothing on record"
        description={`MyAnimeList has no ${formatSeasonLabel(season)} ${year} entries yet.`}
      />
    );
  }

  return (
    <MediaLoadMoreGrid
      initialItems={result.data.map(({ node }) => toAnimeGridItem(node))}
      initialHasMore={Boolean(result.paging?.next)}
      loadMoreAction={loadMoreSeasonalAnime.bind(null, year, season)}
      pageSize={PAGE_SIZE}
      media="anime"
      allGenres={allGenres}
    />
  );
}

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; season?: string }>;
}) {
  const params = await searchParams;
  const current = getCurrentAnimeSeason();
  const year = Number(params.year) || current.year;
  const season: AnimeSeason = isAnimeSeason(params.season) ? params.season : current.season;

  const prev = shiftSeason(year, season, -1);
  const next = shiftSeason(year, season, 1);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold sm:text-2xl">Anime Archive</h1>
        <p className="text-sm text-muted">Browse anime by the year and season they aired, straight from MyAnimeList.</p>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-surface p-3 shadow-sm sm:p-4">
        <Link
          href={`/archive?year=${prev.year}&season=${prev.season}`}
          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-muted hover:bg-surface-muted hover:text-foreground sm:px-3"
        >
          <span aria-hidden="true">←</span>
          <span className="hidden sm:inline">
            {formatSeasonLabel(prev.season)} {prev.year}
          </span>
        </Link>

        <SeasonPickerModal year={year} season={season} />

        <Link
          href={`/archive?year=${next.year}&season=${next.season}`}
          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-muted hover:bg-surface-muted hover:text-foreground sm:px-3"
        >
          <span className="hidden sm:inline">
            {formatSeasonLabel(next.season)} {next.year}
          </span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      <Suspense key={`${year}-${season}`} fallback={<GridSkeleton />}>
        <SeasonResults year={year} season={season} />
      </Suspense>
    </div>
  );
}
