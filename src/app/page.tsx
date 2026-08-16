import Image from "next/image";
import { Suspense } from "react";
import { getAnimeRanking, getMangaRanking } from "@/lib/api";
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

export default function Home() {
  return (
    <div className="flex flex-col gap-10">
      <section className="relative overflow-hidden rounded-2xl border border-border">
        <div className="relative aspect-1774/887 min-h-95 w-full sm:min-h-115">
          <Image
            src="/banner.webp"
            alt="MyAniList — Anime & Manga Tracker for MyAnimeList"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <h1 className="sr-only">Track everything you watch and read.</h1>
          <div className="absolute inset-x-0 top-[81%] flex justify-center px-4">
            <div className="w-full max-w-md">
              <SearchBar className="border-white/30 bg-white/95 text-neutral-900 shadow-lg shadow-black/25 placeholder:text-neutral-500 focus-visible:border-accent" />
            </div>
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
