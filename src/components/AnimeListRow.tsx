"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Pencil, Plus } from "lucide-react";
import { updateAnimeStatusAction } from "@/lib/actions";
import { formatMediaType, formatSeasonLabel } from "@/lib/format";
import type { AnimeNode, MyListStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { AnimeListEditModal } from "./AnimeListEditModal";

export function AnimeListRow({
  node,
  listStatus,
  onUpdated,
  onRemoved,
}: {
  node: AnimeNode;
  listStatus: MyListStatus;
  onUpdated: (update: Partial<MyListStatus>) => void;
  onRemoved: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [episodes, setEpisodes] = useState(listStatus.num_episodes_watched ?? 0);
  const [editOpen, setEditOpen] = useState(false);
  const [editSession, setEditSession] = useState(0);

  const total = node.num_episodes || undefined;
  const atMax = total !== undefined && episodes >= total;

  function handleIncrement() {
    if (atMax) return;
    const next = episodes + 1;
    setEpisodes(next);

    const update: Partial<MyListStatus> = { num_episodes_watched: next };
    if (!listStatus.status || listStatus.status === "plan_to_watch" || listStatus.status === "on_hold") {
      update.status = "watching";
    }
    if (total !== undefined && next >= total) {
      update.status = "completed";
    }

    onUpdated(update);
    startTransition(() =>
      updateAnimeStatusAction({ animeId: node.id, num_watched_episodes: next, status: update.status }),
    );
  }

  const seasonLabel = node.start_season
    ? `${formatSeasonLabel(node.start_season.season)} ${node.start_season.year}`
    : undefined;
  const pct = total ? Math.min(100, (episodes / total) * 100) : 0;

  return (
    <>
      <div
        data-testid={`anime-list-row-${node.id}`}
        className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 sm:gap-4"
      >
        <Link
          href={`/anime/${node.id}`}
          className="relative h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-muted sm:h-24 sm:w-16"
        >
          {node.main_picture && (
            <Image src={node.main_picture.medium} alt={node.title} fill sizes="64px" className="object-cover" />
          )}
        </Link>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Link
            href={`/anime/${node.id}`}
            className="line-clamp-2 text-sm font-semibold text-foreground hover:text-accent sm:text-base"
          >
            {node.title}
          </Link>
          <p className="text-xs text-muted sm:text-sm">
            {formatMediaType(node.media_type)}
            {seasonLabel ? ` · ${seasonLabel}` : ""}
          </p>

          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
              <div className="h-full rounded-full bg-accent transition-all duration-300" style={{ width: `${pct}%` }} />
            </div>
            <span className="shrink-0 text-xs font-medium text-muted sm:text-sm">
              {episodes} / {total ?? "?"} ep
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Edit"
            onClick={() => {
              setEditSession((s) => s + 1);
              setEditOpen(true);
            }}
            className="border-border/60"
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Increase episodes watched"
            onClick={handleIncrement}
            disabled={isPending || atMax}
            className="border-border/60"
          >
            <Plus className="size-3.5" />
          </Button>
        </div>
      </div>

      <AnimeListEditModal
        key={editSession}
        node={node}
        listStatus={{ ...listStatus, num_episodes_watched: episodes }}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={(update) => {
          if (update.num_episodes_watched !== undefined) setEpisodes(update.num_episodes_watched);
          onUpdated(update);
        }}
        onRemoved={onRemoved}
      />
    </>
  );
}
