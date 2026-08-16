"use client";

import { useEffect, useState } from "react";
import { formatCountdown } from "@/lib/format";
import type { NextAiringEpisode } from "@/lib/types";

export function NextEpisodeCountdown({ schedule }: { schedule: NextAiringEpisode }) {
  const airingAtMs = new Date(schedule.airingAt).getTime();
  const [remainingMs, setRemainingMs] = useState(() => airingAtMs - Date.now());

  useEffect(() => {
    const id = setInterval(() => setRemainingMs(airingAtMs - Date.now()), 1000);
    return () => clearInterval(id);
  }, [airingAtMs]);

  const absoluteTime = new Date(airingAtMs).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        Episode {schedule.episode} airs
      </p>
      <p className="text-sm text-foreground">{absoluteTime}</p>
      <p className="text-sm font-semibold text-accent">{formatCountdown(remainingMs)}</p>
    </div>
  );
}
