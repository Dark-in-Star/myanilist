import { Suspense } from "react";
import { getAnimeRanking, getMangaRanking } from "@/lib/api";
import { HeroBackdrop } from "@/components/HeroBackdrop";
import { MediaCard } from "@/components/MediaCard";
import { MediaRow, MediaRowItem } from "@/components/MediaRow";
import { RowSkeleton } from "@/components/RowSkeleton";
import { SearchBar } from "@/components/SearchBar";
import type { AnimeRankingType, MangaRankingType } from "@/lib/types";

async function AnimeRankingRow({
  title,
  rankingType,
  viewAllHref,
  priority = false,
}: {
  title: string;
  rankingType: AnimeRankingType;
  viewAllHref: string;
  priority?: boolean;
}) {
  const result = await getAnimeRanking(rankingType, 12);
  return (
    <MediaRow title={title} viewAllHref={viewAllHref}>
      {result.data.map(({ node, ranking }, index) => (
        <MediaRowItem key={node.id}>
          <MediaCard
            href={`/anime/${node.id}`}
            title={node.title}
            imageUrl={node.main_picture?.large ?? node.main_picture?.medium}
            mean={node.mean}
            mediaType={node.media_type}
            rank={ranking.rank}
            priority={priority && index === 0}
          />
        </MediaRowItem>
      ))}
    </MediaRow>
  );
}

async function MangaRankingRow({
  title,
  rankingType,
  viewAllHref,
}: {
  title: string;
  rankingType: MangaRankingType;
  viewAllHref: string;
}) {
  const result = await getMangaRanking(rankingType, 12);
  return (
    <MediaRow title={title} viewAllHref={viewAllHref}>
      {result.data.map(({ node, ranking }) => (
        <MediaRowItem key={node.id}>
          <MediaCard
            href={`/manga/${node.id}`}
            title={node.title}
            imageUrl={node.main_picture?.large ?? node.main_picture?.medium}
            mean={node.mean}
            mediaType={node.media_type}
            rank={ranking.rank}
          />
        </MediaRowItem>
      ))}
    </MediaRow>
  );
}

async function HeroBackdropData() {
  // Reuses the same "top anime" ranking already shown below, so the hero backdrop
  // is always real, relevant cover art instead of unrelated stock images.
  const result = await getAnimeRanking("all", 8);
  const images = result.data
    .map(({ node }) => node.main_picture?.large ?? node.main_picture?.medium)
    .filter((url): url is string => Boolean(url));

  return <HeroBackdrop images={images} />;
}

export default function Home() {
  return (
    <div className="flex flex-col gap-10">
      <section className="relative flex min-h-95 flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border border-border bg-surface px-4 py-16 text-center sm:min-h-115 sm:py-24">
        <Suspense fallback={null}>
          <HeroBackdropData />
        </Suspense>
        <div className="relative flex flex-col items-center gap-4">
          <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-sm sm:text-4xl">
            Track everything you watch and read.
          </h1>
          <p className="max-w-lg text-sm text-white/80 drop-shadow-sm sm:text-base">
            Search, browse rankings, and manage your anime and manga lists — all powered by the official
            MyAnimeList API.
          </p>
          <div className="w-full max-w-md">
            <SearchBar />
          </div>
        </div>
      </section>

      <Suspense fallback={<RowSkeleton />}>
        <AnimeRankingRow
          title="Currently Airing"
          rankingType="airing"
          viewAllHref="/browse?media=anime&type=airing"
          priority
        />
      </Suspense>

      <Suspense fallback={<RowSkeleton />}>
        <AnimeRankingRow title="Top Anime" rankingType="all" viewAllHref="/browse?media=anime&type=all" />
      </Suspense>

      <Suspense fallback={<RowSkeleton />}>
        <AnimeRankingRow title="Upcoming Anime" rankingType="upcoming" viewAllHref="/browse?media=anime&type=upcoming" />
      </Suspense>

      <Suspense fallback={<RowSkeleton />}>
        <MangaRankingRow title="Top Manga" rankingType="all" viewAllHref="/browse?media=manga&type=all" />
      </Suspense>

      <Suspense fallback={<RowSkeleton />}>
        <MangaRankingRow
          title="Popular Manga"
          rankingType="bypopularity"
          viewAllHref="/browse?media=manga&type=bypopularity"
        />
      </Suspense>
    </div>
  );
}
