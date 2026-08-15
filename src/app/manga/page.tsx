import type { Metadata } from "next";
import { Suspense } from "react";
import { getMangaRanking } from "@/lib/api";
import { loadMoreMangaRanking } from "@/lib/browseActions";
import { toMangaGridItem } from "@/lib/gridItems";
import { MediaLoadMoreGrid } from "@/components/MediaLoadMoreGrid";
import { RankingTabs } from "@/components/RankingTabs";
import { GridSkeleton } from "@/components/GridSkeleton";
import { MANGA_RANKING_TABS } from "@/lib/format";
import type { MangaRankingType } from "@/lib/types";

export const metadata: Metadata = { title: "Manga" };

const PAGE_SIZE = 24;

function isRankingType(value: string | undefined): value is MangaRankingType {
  return MANGA_RANKING_TABS.some((tab) => tab.value === value);
}

async function MangaResults({ type }: { type: MangaRankingType }) {
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

export default async function MangaPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const type: MangaRankingType = isRankingType(params.type) ? params.type : "all";

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-bold sm:text-2xl">Manga Rankings</h1>
      <RankingTabs basePath="/manga" tabs={MANGA_RANKING_TABS} active={type} />
      <Suspense key={type} fallback={<GridSkeleton />}>
        <MangaResults type={type} />
      </Suspense>
    </div>
  );
}
