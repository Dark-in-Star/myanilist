import type { Metadata } from "next";
import { Suspense } from "react";
import { getAnimeRanking } from "@/lib/api";
import { MediaCard } from "@/components/MediaCard";
import { MediaGrid } from "@/components/MediaGrid";
import { RankingTabs } from "@/components/RankingTabs";
import { GridSkeleton } from "@/components/GridSkeleton";
import { LoadMoreLink } from "@/components/LoadMoreLink";
import { ANIME_RANKING_TABS } from "@/lib/format";
import type { AnimeRankingType } from "@/lib/types";

export const metadata: Metadata = { title: "Anime" };

const PAGE_SIZE = 24;

function isRankingType(value: string | undefined): value is AnimeRankingType {
  return ANIME_RANKING_TABS.some((tab) => tab.value === value);
}

async function AnimeResults({ type, limit }: { type: AnimeRankingType; limit: number }) {
  const result = await getAnimeRanking(type, limit);
  return (
    <>
      <MediaGrid>
        {result.data.map(({ node, ranking }) => (
          <MediaCard
            key={node.id}
            href={`/anime/${node.id}`}
            title={node.title}
            imageUrl={node.main_picture?.large ?? node.main_picture?.medium}
            mean={node.mean}
            mediaType={node.media_type}
            rank={ranking.rank}
          />
        ))}
      </MediaGrid>
      <LoadMoreLink href={`/anime?type=${type}&limit=${limit + PAGE_SIZE}`} hasMore={Boolean(result.paging?.next)} />
    </>
  );
}

export default async function AnimePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; limit?: string }>;
}) {
  const params = await searchParams;
  const type: AnimeRankingType = isRankingType(params.type) ? params.type : "all";
  const limit = Math.min(Number(params.limit) || PAGE_SIZE, 500);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-bold sm:text-2xl">Anime Rankings</h1>
      <RankingTabs basePath="/anime" tabs={ANIME_RANKING_TABS} active={type} />
      <Suspense key={`${type}-${limit}`} fallback={<GridSkeleton />}>
        <AnimeResults type={type} limit={limit} />
      </Suspense>
    </div>
  );
}
