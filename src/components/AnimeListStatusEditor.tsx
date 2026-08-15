"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { removeAnimeAction, updateAnimeStatusAction } from "@/lib/actions";
import { ANIME_LIST_STATUS_LABELS } from "@/lib/format";
import type { ListStatus, MyListStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUS_OPTIONS = Object.entries(ANIME_LIST_STATUS_LABELS) as [ListStatus, string][];

export function AnimeListStatusEditor({
  animeId,
  numEpisodes,
  initial,
  isAuthenticated,
}: {
  animeId: number;
  numEpisodes?: number;
  initial?: MyListStatus;
  isAuthenticated: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<ListStatus | "">(initial?.status ?? "");
  const [score, setScore] = useState(initial?.score ?? 0);
  const [episodes, setEpisodes] = useState(initial?.num_episodes_watched ?? 0);
  const [removed, setRemoved] = useState(false);

  function save(next: { status?: ListStatus; score?: number; num_watched_episodes?: number }) {
    startTransition(async () => {
      await updateAnimeStatusAction({ animeId, ...next });
      setRemoved(false);
    });
  }

  function handleRemove() {
    startTransition(async () => {
      await removeAnimeAction(animeId);
      setStatus("");
      setScore(0);
      setEpisodes(0);
      setRemoved(true);
    });
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col gap-2 rounded-xl border border-dashed border-border bg-surface p-4 text-center">
        <p className="text-sm font-semibold text-foreground">Track this anime</p>
        <p className="text-xs text-muted">Log in with MyAnimeList to add it to your list.</p>
        <Link href="/auth/login" className="text-xs font-semibold text-accent hover:underline">
          Log in with MyAnimeList
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
      <h3 className="text-sm font-semibold text-foreground">Your list status</h3>
      {removed && <p className="text-xs text-muted">Removed from your list.</p>}

      <Label className="flex flex-col items-stretch gap-1 text-xs font-medium text-muted">
        Status
        <Select
          value={status || undefined}
          onValueChange={(next: ListStatus) => {
            setStatus(next);
            save({ status: next });
          }}
          disabled={isPending}
        >
          <SelectTrigger className="w-full bg-surface-muted text-sm text-foreground">
            <SelectValue placeholder="Add to list..." />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Label>

      <div className="grid grid-cols-2 gap-3">
        <Label className="flex flex-col items-stretch gap-1 text-xs font-medium text-muted">
          Score
          <Select
            value={String(score)}
            onValueChange={(next) => {
              const value = Number(next);
              setScore(value);
              save({ score: value });
            }}
            disabled={isPending}
          >
            <SelectTrigger className="w-full bg-surface-muted text-sm text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 11 }, (_, i) => i).map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n === 0 ? "—" : n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Label>

        <Label className="flex flex-col items-stretch gap-1 text-xs font-medium text-muted">
          Episodes
          <div className="flex items-center gap-1">
            <Input
              type="number"
              min={0}
              max={numEpisodes || undefined}
              value={episodes}
              onChange={(e) => setEpisodes(Number(e.target.value))}
              onBlur={() => save({ num_watched_episodes: episodes })}
              disabled={isPending}
              className="w-full bg-surface-muted text-sm text-foreground"
            />
            <span className="text-xs text-muted">/ {numEpisodes || "?"}</span>
          </div>
        </Label>
      </div>

      {status && (
        <Button
          type="button"
          variant="link"
          onClick={handleRemove}
          disabled={isPending}
          className="h-auto self-start p-0 text-xs font-medium text-danger"
        >
          Remove from list
        </Button>
      )}
    </div>
  );
}
