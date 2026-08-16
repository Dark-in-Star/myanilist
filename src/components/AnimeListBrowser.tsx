"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { AnimeListRow } from "./AnimeListRow";
import { EmptyState } from "./EmptyState";
import { RevealList } from "./RevealList";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ANIME_LIST_STATUS_LABELS } from "@/lib/format";
import type { AnimeNode, ListNode, ListStatus, MyListStatus } from "@/lib/types";

type Entry = ListNode<AnimeNode, MyListStatus>;

const STATUS_TABS: { value: ListStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  ...(Object.entries(ANIME_LIST_STATUS_LABELS) as [ListStatus, string][]).map(([value, label]) => ({
    value,
    label,
  })),
];

const TYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "tv", label: "TV" },
  { value: "ona", label: "ONA" },
  { value: "ova", label: "OVA" },
  { value: "movie", label: "Movie" },
  { value: "special", label: "Special" },
  { value: "cm", label: "CM" },
  { value: "pv", label: "PV" },
  { value: "tv_special", label: "TV Special" },
];

const SORT_OPTIONS = [
  { value: "title", label: "Alphabetical" },
  { value: "score", label: "Score" },
  { value: "episodes", label: "Episodes Watched" },
  { value: "start_date", label: "Air Start Date" },
  { value: "updated", label: "Last Updated" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

const COMPARATORS: Record<SortValue, (a: Entry, b: Entry) => number> = {
  title: (a, b) => a.node.title.localeCompare(b.node.title),
  score: (a, b) => (b.list_status.score ?? 0) - (a.list_status.score ?? 0),
  episodes: (a, b) => (b.list_status.num_episodes_watched ?? 0) - (a.list_status.num_episodes_watched ?? 0),
  start_date: (a, b) => (b.node.start_date ?? "").localeCompare(a.node.start_date ?? ""),
  updated: (a, b) => (b.list_status.updated_at ?? "").localeCompare(a.list_status.updated_at ?? ""),
};

export function AnimeListBrowser({ entries, initialStatus }: { entries: Entry[]; initialStatus: ListStatus | "all" }) {
  const [status, setStatus] = useState<ListStatus | "all">(initialStatus);
  const [type, setType] = useState("all");
  const [sort, setSort] = useState<SortValue>("title");

  const counts = useMemo(() => {
    return entries.reduce<Record<string, number>>((acc, e) => {
      const key = e.list_status.status ?? "unknown";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
  }, [entries]);

  const filtered = useMemo(() => {
    return entries
      .filter((e) => status === "all" || e.list_status.status === status)
      .filter((e) => type === "all" || e.node.media_type === type)
      .slice()
      .sort(COMPARATORS[sort]);
  }, [entries, status, type, sort]);

  return (
    <div className="flex flex-col gap-5">
      <div className="no-scrollbar -mx-3 flex min-w-0 gap-1 overflow-x-auto border-b border-border px-3 sm:mx-0 sm:gap-2 sm:px-0">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStatus(tab.value)}
            className={clsx(
              "-mb-px shrink-0 whitespace-nowrap border-b-2 px-2.5 py-2.5 text-sm transition-colors sm:px-3.5",
              tab.value === status
                ? "border-accent font-semibold text-foreground"
                : "border-transparent font-medium text-muted hover:text-foreground",
            )}
          >
            {tab.label}
            {tab.value !== "all" && counts[tab.value] ? (
              <span className="ml-1 text-xs text-muted">({counts[tab.value]})</span>
            ) : null}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select value={type} onValueChange={setType}>
          <SelectTrigger aria-label="Type" className="w-fit min-w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={(value) => setSort(value as SortValue)}>
          <SelectTrigger aria-label="Sort" className="w-fit min-w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Nothing here yet" description="Anime you add to this status will show up here." />
      ) : (
        <RevealList
          items={filtered.map(({ node, list_status }) => (
            <AnimeListRow key={node.id} node={node} listStatus={list_status} />
          ))}
        />
      )}
    </div>
  );
}
