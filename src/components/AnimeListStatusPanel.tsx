"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import clsx from "clsx";
import { ListPlus, Pencil, Plus, Star } from "lucide-react";
import { updateAnimeStatusAction } from "@/lib/actions";
import { ANIME_LIST_STATUS_LABELS } from "@/lib/format";
import type { AnimeNode, ListStatus, MyListStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { AnimeListEditModal } from "./AnimeListEditModal";

const STATUS_STYLES: Record<ListStatus, string> = {
  watching: "bg-accent-soft text-accent",
  completed: "bg-[color-mix(in_srgb,var(--score)_15%,transparent)] text-score",
  on_hold: "bg-surface-muted text-muted",
  dropped: "bg-danger-soft text-danger",
  plan_to_watch: "bg-surface-muted text-muted",
};

export function AnimeListStatusPanel({
  anime,
  initial,
  isAuthenticated,
}: {
  anime: AnimeNode;
  initial?: MyListStatus;
  isAuthenticated: boolean;
}) {
  const [listStatus, setListStatus] = useState<MyListStatus | undefined>(initial?.status ? initial : undefined);
  const [episodes, setEpisodes] = useState(initial?.num_episodes_watched ?? 0);
  const [isPending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);
  const [editSession, setEditSession] = useState(0);

  const pathname = usePathname();

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-surface p-5 text-center">
        <p className="text-sm font-semibold text-foreground">Track this anime</p>
        <p className="text-xs text-muted">Log in with MyAnimeList to add it to your list, rate it, and track progress.</p>
        <Button asChild size="sm" className="mt-1">
          <Link href={`/auth/login?returnTo=${encodeURIComponent(pathname)}`}>Log in with MyAnimeList</Link>
        </Button>
      </div>
    );
  }

  const total = anime.num_episodes || undefined;
  const atMax = total !== undefined && episodes >= total;

  function openEdit() {
    setEditSession((s) => s + 1);
    setEditOpen(true);
  }

  function handleIncrement() {
    if (!listStatus?.status || atMax) return;
    const next = episodes + 1;
    let nextStatus: ListStatus = listStatus.status;
    if (nextStatus === "plan_to_watch" || nextStatus === "on_hold") nextStatus = "watching";
    if (total !== undefined && next >= total) nextStatus = "completed";

    setEpisodes(next);
    setListStatus((prev) => (prev ? { ...prev, num_episodes_watched: next, status: nextStatus } : prev));
    startTransition(() =>
      updateAnimeStatusAction({ animeId: anime.id, num_watched_episodes: next, status: nextStatus }),
    );
  }

  if (!listStatus?.status) {
    return (
      <>
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-accent/40 bg-accent-soft/40 p-5 text-center">
          <div className="flex size-10 items-center justify-center rounded-full bg-accent-soft text-accent">
            <ListPlus className="size-5" />
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-semibold text-foreground">Add to your list</p>
            <p className="text-xs text-muted">Track your progress, rate it, and get better recommendations.</p>
          </div>
          <Button type="button" onClick={openEdit} className="w-full gap-1.5">
            <Plus className="size-4" /> Add to List
          </Button>
        </div>

        <AnimeListEditModal
          key={editSession}
          node={anime}
          listStatus={{ score: 0 }}
          isNew
          open={editOpen}
          onOpenChange={setEditOpen}
          onSaved={(update) => {
            setListStatus((prev) => ({ ...(prev ?? { score: 0 }), ...update }));
            if (update.num_episodes_watched !== undefined) setEpisodes(update.num_episodes_watched);
          }}
          onRemoved={() => setListStatus(undefined)}
        />
      </>
    );
  }

  const pct = total ? Math.min(100, (episodes / total) * 100) : 0;
  const myScore = listStatus.score ?? 0;

  return (
    <>
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between gap-2">
          <span className={clsx("rounded-lg px-2.5 py-1 text-xs font-semibold", STATUS_STYLES[listStatus.status])}>
            {ANIME_LIST_STATUS_LABELS[listStatus.status]}
          </span>
          <Button type="button" variant="outline" size="icon-sm" aria-label="Edit list entry" onClick={openEdit}>
            <Pencil className="size-3.5" />
          </Button>
        </div>

        {myScore > 0 && (
          <span className="inline-flex w-fit items-center gap-1 rounded-md bg-accent-soft px-2 py-1 text-sm font-semibold text-accent">
            <Star className="size-3.5" fill="currentColor" />
            My score: {myScore}
          </span>
        )}

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-muted">
            <span>Progress</span>
            <span>
              {episodes} / {total ?? "?"} ep
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
            <div className="h-full rounded-full bg-accent transition-all duration-300" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleIncrement}
          disabled={isPending || atMax}
          className="gap-1.5"
        >
          <Plus className="size-3.5" /> {atMax ? "Completed" : "Episode watched"}
        </Button>
      </div>

      <AnimeListEditModal
        key={editSession}
        node={anime}
        listStatus={{ ...listStatus, num_episodes_watched: episodes }}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={(update) => {
          setListStatus((prev) => (prev ? { ...prev, ...update } : prev));
          if (update.num_episodes_watched !== undefined) setEpisodes(update.num_episodes_watched);
        }}
        onRemoved={() => {
          setListStatus(undefined);
          setEpisodes(0);
        }}
      />
    </>
  );
}
