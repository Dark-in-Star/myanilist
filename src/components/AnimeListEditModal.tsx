"use client";

import { useState, useTransition } from "react";
import clsx from "clsx";
import { Trash2, X } from "lucide-react";
import { removeAnimeAction, updateAnimeStatusAction } from "@/lib/actions";
import { ANIME_LIST_STATUS_LABELS, formatAnimeStatus, formatDateRange } from "@/lib/format";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollableTabRow } from "@/components/ScrollableTabRow";
import type { AnimeNode, ListStatus, MyListStatus } from "@/lib/types";

const STATUS_OPTIONS = Object.entries(ANIME_LIST_STATUS_LABELS) as [ListStatus, string][];
const SCORE_OPTIONS = [0, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

export function AnimeListEditModal({
  node,
  listStatus,
  open,
  onOpenChange,
  onSaved,
  onRemoved,
}: {
  node: AnimeNode;
  listStatus: MyListStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (update: Partial<MyListStatus>) => void;
  onRemoved: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(listStatus.status);
  const [score, setScore] = useState(listStatus.score ?? 0);
  const [episodes, setEpisodes] = useState(listStatus.num_episodes_watched ?? 0);

  const total = node.num_episodes || undefined;
  const episodeOptions = Array.from({ length: (total ?? Math.max(episodes, 12)) + 1 }, (_, i) => i);

  function handleSave() {
    startTransition(async () => {
      await updateAnimeStatusAction({ animeId: node.id, status, score, num_watched_episodes: episodes });
      onSaved({ status, score, num_episodes_watched: episodes });
      onOpenChange(false);
    });
  }

  function handleRemove() {
    startTransition(async () => {
      await removeAnimeAction(node.id);
      onRemoved();
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="inset-0 top-0 left-0 flex h-full max-h-full w-full max-w-full translate-x-0 translate-y-0 flex-col gap-0 overflow-y-auto rounded-none border-0 p-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:h-auto sm:max-h-[85vh] sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Close" onClick={() => onOpenChange(false)}>
            <X className="size-4" />
          </Button>
          <Button
            type="button"
            variant="link"
            onClick={handleSave}
            disabled={isPending}
            className="h-auto p-0 text-sm font-semibold text-accent"
          >
            Save
          </Button>
        </div>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-4">
          <div>
            <DialogTitle className="text-base font-bold text-foreground">{node.title}</DialogTitle>
            <DialogDescription className="sr-only">Edit your list entry for {node.title}</DialogDescription>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">Status</span>
              <span className="text-xs text-muted">{formatAnimeStatus(node.status)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {STATUS_OPTIONS.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatus(value)}
                  className={clsx(
                    "rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                    status === value
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border bg-surface text-muted hover:border-accent hover:text-accent",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">Progress</span>
              <span className="text-xs text-muted">{total ?? "?"} ep</span>
            </div>
            <ScrollableTabRow>
              {episodeOptions.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setEpisodes(n)}
                  aria-label={`Episode ${n}`}
                  className={clsx(
                    "shrink-0 rounded-lg border px-3.5 py-2 text-sm font-semibold transition-colors",
                    n === episodes
                      ? "border-accent text-accent"
                      : "border-transparent text-muted hover:border-border hover:text-foreground",
                  )}
                >
                  {n}
                </button>
              ))}
            </ScrollableTabRow>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">Score</span>
            <ScrollableTabRow>
              {SCORE_OPTIONS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setScore(n)}
                  aria-label={n === 0 ? "Not scored" : `Score ${n}`}
                  className={clsx(
                    "shrink-0 rounded-lg border px-3.5 py-2 text-sm font-semibold transition-colors",
                    n === score
                      ? "border-accent text-accent"
                      : "border-transparent text-muted hover:border-border hover:text-foreground",
                  )}
                >
                  {n === 0 ? "-" : n}
                </button>
              ))}
            </ScrollableTabRow>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
            <span className="font-semibold text-muted">Aired</span>
            <span className="text-foreground">{formatDateRange(node.start_date, node.end_date)}</span>
          </div>
        </div>

        <div className="shrink-0 border-t border-border px-4 py-3">
          <Button
            type="button"
            variant="ghost"
            onClick={handleRemove}
            disabled={isPending}
            className="h-auto w-full justify-start gap-2 p-0 text-sm font-medium text-danger hover:bg-transparent hover:text-danger"
          >
            <Trash2 className="size-4" /> Remove from list
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
