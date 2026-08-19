import Image from "next/image";
import { Poppins } from "next/font/google";
import { Suspense } from "react";
import { getAnimeRanking, getMangaRanking } from "@/lib/api";
import { MediaCard } from "@/components/MediaCard";
import { MediaRow, MediaRowItem } from "@/components/MediaRow";
import { RowSkeleton } from "@/components/RowSkeleton";
import { SearchBar } from "@/components/SearchBar";
import type { AnimeRankingType, MangaRankingType } from "@/lib/types";

const heroFont = Poppins({ subsets: ["latin"], weight: ["600", "800"] });

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
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-x-0 top-[10%] bottom-[21%] flex flex-col items-center justify-center gap-3 px-4 text-center sm:gap-4">
            <Image
              src="/logo.webp"
              alt=""
              width={112}
              height={112}
              priority
              className="h-14 w-14 drop-shadow-lg sm:h-20 sm:w-20 md:h-24 md:w-24"
            />
            <h1
              className={`${heroFont.className} text-4xl font-extrabold text-white drop-shadow-lg sm:text-6xl md:text-7xl`}
            >
              MyAniList
            </h1>
            <p className={`${heroFont.className} max-w-lg text-base font-semibold text-white/90 drop-shadow sm:text-xl md:text-2xl`}>
              Anime &amp; Manga Tracker for MyAnimeList
            </p>
          </div>
          <div className="absolute inset-x-0 bottom-[9%] flex justify-center px-4 sm:bottom-[11%]">
            <div className="w-full max-w-md">
              <SearchBar className="border-white/40 bg-white/95 text-neutral-900 shadow-lg shadow-black/30 ring-1 ring-black/5 placeholder:text-neutral-500 focus-visible:border-accent dark:border-white/40 dark:bg-white/95 dark:text-neutral-900 dark:placeholder:text-neutral-500 dark:shadow-black/40" />
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
