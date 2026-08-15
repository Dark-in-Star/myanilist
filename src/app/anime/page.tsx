import type { Metadata } from "next";
import { Suspense } from "react";
import { getAnimeRanking } from "@/lib/api";
import { loadMoreAnimeRanking } from "@/lib/browseActions";
import { toAnimeGridItem } from "@/lib/gridItems";
import { MediaLoadMoreGrid } from "@/components/MediaLoadMoreGrid";
import { RankingTabs } from "@/components/RankingTabs";
import { GridSkeleton } from "@/components/GridSkeleton";
import { ANIME_RANKING_TABS } from "@/lib/format";
import type { AnimeRankingType } from "@/lib/types";

export const metadata: Metadata = { title: "Anime" };

const PAGE_SIZE = 24;

function isRankingType(value: string | undefined): value is AnimeRankingType {
  return ANIME_RANKING_TABS.some((tab) => tab.value === value);
}

async function AnimeResults({ type }: { type: AnimeRankingType }) {
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

export default async function AnimePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const type: AnimeRankingType = isRankingType(params.type) ? params.type : "all";

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-bold sm:text-2xl">Anime Rankings</h1>
      <RankingTabs basePath="/anime" tabs={ANIME_RANKING_TABS} active={type} />
      <Suspense key={type} fallback={<GridSkeleton />}>
        <AnimeResults type={type} />
      </Suspense>
    </div>
  );
}
