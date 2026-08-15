"use client";

import { useState, useTransition } from "react";
import { removeAnimeAction, updateAnimeStatusAction } from "@/lib/actions";
import { ANIME_LIST_STATUS_LABELS } from "@/lib/format";
import type { ListStatus, MyListStatus } from "@/lib/types";

const STATUS_OPTIONS = Object.entries(ANIME_LIST_STATUS_LABELS) as [ListStatus, string][];

export function AnimeListStatusEditor({
  animeId,
  numEpisodes,
  initial,
}: {
  animeId: number;
  numEpisodes?: number;
  initial?: MyListStatus;
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

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
      <h3 className="text-sm font-semibold text-foreground">Your list status</h3>
      {removed && <p className="text-xs text-muted">Removed from your list.</p>}

      <label className="flex flex-col gap-1 text-xs font-medium text-muted">
        Status
        <select
          value={status}
          onChange={(e) => {
            const next = e.target.value as ListStatus | "";
            setStatus(next);
            if (next) save({ status: next });
          }}
          disabled={isPending}
          className="rounded-md border border-border bg-surface-muted px-3 py-2 text-sm text-foreground"
        >
          <option value="">Add to list...</option>
          {STATUS_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-xs font-medium text-muted">
          Score
          <select
            value={score}
            onChange={(e) => {
              const next = Number(e.target.value);
              setScore(next);
              save({ score: next });
            }}
            disabled={isPending}
            className="rounded-md border border-border bg-surface-muted px-3 py-2 text-sm text-foreground"
          >
            {Array.from({ length: 11 }, (_, i) => i).map((n) => (
              <option key={n} value={n}>
                {n === 0 ? "—" : n}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-muted">
          Episodes
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              max={numEpisodes || undefined}
              value={episodes}
              onChange={(e) => setEpisodes(Number(e.target.value))}
              onBlur={() => save({ num_watched_episodes: episodes })}
              disabled={isPending}
              className="w-full rounded-md border border-border bg-surface-muted px-3 py-2 text-sm text-foreground"
            />
            <span className="text-xs text-muted">/ {numEpisodes || "?"}</span>
          </div>
        </label>
      </div>

      {status && (
        <button
          type="button"
          onClick={handleRemove}
          disabled={isPending}
          className="self-start text-xs font-medium text-danger hover:underline"
        >
          Remove from list
        </button>
      )}
    </div>
  );
}
