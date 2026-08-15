import type { Metadata } from "next";
import Link from "next/link";
import clsx from "clsx";
import { AuthRequiredError, getAnimeList } from "@/lib/api";
import { AnimeListRow } from "@/components/AnimeListRow";
import { EmptyState } from "@/components/EmptyState";
import { LoginPrompt } from "@/components/LoginPrompt";
import { RevealList } from "@/components/RevealList";
import { ANIME_LIST_STATUS_LABELS } from "@/lib/format";
import type { ListStatus } from "@/lib/types";

export const metadata: Metadata = { title: "My Anime List" };

const TABS: { value: ListStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  ...(Object.entries(ANIME_LIST_STATUS_LABELS) as [ListStatus, string][]).map(([value, label]) => ({
    value,
    label,
  })),
];

export default async function MyAnimeListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const activeTab = (params.status ?? "all") as ListStatus | "all";

  let entries;
  try {
    const result = await getAnimeList();
    entries = result.data;
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      return <LoginPrompt description="Log in to see and manage your anime list." />;
    }
    throw error;
  }

  const filtered = activeTab === "all" ? entries : entries.filter((e) => e.list_status.status === activeTab);
  const counts = entries.reduce<Record<string, number>>((acc, e) => {
    const key = e.list_status.status ?? "unknown";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-bold sm:text-2xl">My Anime List</h1>

      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/mylist/anime?status=${tab.value}`}
            className={clsx(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium",
              tab.value === activeTab
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-surface text-muted hover:border-accent hover:text-accent",
            )}
          >
            {tab.label} {tab.value !== "all" && counts[tab.value] ? `(${counts[tab.value]})` : ""}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Nothing here yet" description="Anime you add to this status will show up here." />
      ) : (
        <RevealList items={filtered.map(({ node, list_status }) => (
          <AnimeListRow key={node.id} node={node} listStatus={list_status} />
        ))} />
      )}
    </div>
  );
}
