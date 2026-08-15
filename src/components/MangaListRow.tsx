"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { removeMangaAction, updateMangaStatusAction } from "@/lib/actions";
import { MANGA_LIST_STATUS_LABELS } from "@/lib/format";
import type { MangaListStatus, MangaNode, MyMangaListStatusNode } from "@/lib/types";

const STATUS_OPTIONS = Object.entries(MANGA_LIST_STATUS_LABELS) as [MangaListStatus, string][];

export function MangaListRow({ node, listStatus }: { node: MangaNode; listStatus: MyMangaListStatusNode }) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<MangaListStatus>(listStatus.status ?? "reading");
  const [score, setScore] = useState(listStatus.score ?? 0);
  const [chapters, setChapters] = useState(listStatus.num_chapters_read ?? 0);
  const [hidden, setHidden] = useState(false);

  function save(next: { status?: MangaListStatus; score?: number; num_chapters_read?: number }) {
    startTransition(() => updateMangaStatusAction({ mangaId: node.id, ...next }));
  }

  function handleRemove() {
    startTransition(async () => {
      await removeMangaAction(node.id);
      setHidden(true);
    });
  }

  if (hidden) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 sm:gap-4">
      <Link href={`/manga/${node.id}`} className="relative h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-muted sm:h-24 sm:w-16">
        {node.main_picture && (
          <Image src={node.main_picture.medium} alt={node.title} fill sizes="64px" className="object-cover" />
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Link href={`/manga/${node.id}`} className="line-clamp-2 text-sm font-semibold text-foreground hover:text-accent sm:text-base">
          {node.title}
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={status}
            onChange={(e) => {
              const next = e.target.value as MangaListStatus;
              setStatus(next);
              save({ status: next });
            }}
            disabled={isPending}
            className="rounded-md border border-border bg-surface-muted px-2 py-1 text-xs font-medium text-foreground sm:text-sm"
          >
            {STATUS_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={score}
            onChange={(e) => {
              const next = Number(e.target.value);
              setScore(next);
              save({ score: next });
            }}
            disabled={isPending}
            className="rounded-md border border-border bg-surface-muted px-2 py-1 text-xs font-medium text-foreground sm:text-sm"
            aria-label="Score"
          >
            {Array.from({ length: 11 }, (_, i) => i).map((n) => (
              <option key={n} value={n}>
                {n === 0 ? "Score" : `★ ${n}`}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1 text-xs text-muted sm:text-sm">
            <input
              type="number"
              min={0}
              max={node.num_chapters || undefined}
              value={chapters}
              onChange={(e) => setChapters(Number(e.target.value))}
              onBlur={() => save({ num_chapters_read: chapters })}
              disabled={isPending}
              aria-label="Chapters read"
              className="w-14 rounded-md border border-border bg-surface-muted px-2 py-1 text-foreground"
            />
            <span>/ {node.num_chapters || "?"} ch</span>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            disabled={isPending}
            className="ml-auto text-xs font-medium text-danger hover:underline"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
