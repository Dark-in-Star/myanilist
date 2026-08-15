"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { removeMangaAction, updateMangaStatusAction } from "@/lib/actions";
import { MANGA_LIST_STATUS_LABELS } from "@/lib/format";
import type { MangaListStatus, MangaNode, MyMangaListStatusNode } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
          <Select
            value={status}
            onValueChange={(next: MangaListStatus) => {
              setStatus(next);
              save({ status: next });
            }}
            disabled={isPending}
          >
            <SelectTrigger size="sm" className="bg-surface-muted text-xs font-medium text-foreground sm:text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={String(score)}
            onValueChange={(next) => {
              const value = Number(next);
              setScore(value);
              save({ score: value });
            }}
            disabled={isPending}
          >
            <SelectTrigger size="sm" aria-label="Score" className="bg-surface-muted text-xs font-medium text-foreground sm:text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 11 }, (_, i) => i).map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n === 0 ? "Score" : `★ ${n}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1 text-xs text-muted sm:text-sm">
            <Input
              type="number"
              min={0}
              max={node.num_chapters || undefined}
              value={chapters}
              onChange={(e) => setChapters(Number(e.target.value))}
              onBlur={() => save({ num_chapters_read: chapters })}
              disabled={isPending}
              aria-label="Chapters read"
              className="w-14 bg-surface-muted text-foreground"
            />
            <span>/ {node.num_chapters || "?"} ch</span>
          </div>

          <Button
            type="button"
            variant="link"
            onClick={handleRemove}
            disabled={isPending}
            className="ml-auto h-auto p-0 text-xs font-medium text-danger"
          >
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}
