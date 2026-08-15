"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { removeMangaAction, updateMangaStatusAction } from "@/lib/actions";
import { MANGA_LIST_STATUS_LABELS } from "@/lib/format";
import type { MangaListStatus, MyMangaListStatusNode } from "@/lib/types";

const STATUS_OPTIONS = Object.entries(MANGA_LIST_STATUS_LABELS) as [MangaListStatus, string][];

export function MangaListStatusEditor({
  mangaId,
  numChapters,
  numVolumes,
  initial,
  isAuthenticated,
}: {
  mangaId: number;
  numChapters?: number;
  numVolumes?: number;
  initial?: MyMangaListStatusNode;
  isAuthenticated: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<MangaListStatus | "">(initial?.status ?? "");
  const [score, setScore] = useState(initial?.score ?? 0);
  const [chapters, setChapters] = useState(initial?.num_chapters_read ?? 0);
  const [volumes, setVolumes] = useState(initial?.num_volumes_read ?? 0);
  const [removed, setRemoved] = useState(false);

  function save(next: { status?: MangaListStatus; score?: number; num_chapters_read?: number; num_volumes_read?: number }) {
    startTransition(async () => {
      await updateMangaStatusAction({ mangaId, ...next });
      setRemoved(false);
    });
  }

  function handleRemove() {
    startTransition(async () => {
      await removeMangaAction(mangaId);
      setStatus("");
      setScore(0);
      setChapters(0);
      setVolumes(0);
      setRemoved(true);
    });
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col gap-2 rounded-xl border border-dashed border-border bg-surface p-4 text-center">
        <p className="text-sm font-semibold text-foreground">Track this manga</p>
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

      <label className="flex flex-col gap-1 text-xs font-medium text-muted">
        Status
        <select
          value={status}
          onChange={(e) => {
            const next = e.target.value as MangaListStatus | "";
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

      <div className="grid grid-cols-3 gap-3">
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
          Chapters
          <input
            type="number"
            min={0}
            max={numChapters || undefined}
            value={chapters}
            onChange={(e) => setChapters(Number(e.target.value))}
            onBlur={() => save({ num_chapters_read: chapters })}
            disabled={isPending}
            className="w-full rounded-md border border-border bg-surface-muted px-3 py-2 text-sm text-foreground"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-muted">
          Volumes
          <input
            type="number"
            min={0}
            max={numVolumes || undefined}
            value={volumes}
            onChange={(e) => setVolumes(Number(e.target.value))}
            onBlur={() => save({ num_volumes_read: volumes })}
            disabled={isPending}
            className="w-full rounded-md border border-border bg-surface-muted px-3 py-2 text-sm text-foreground"
          />
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
