"use client";

import { useCallback, useRef, useState } from "react";
import { AlertTriangle, CalendarClock, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadStreamSources } from "@/lib/streamActions";
import { cn } from "@/lib/utils";
import type { StreamServer, StreamSources } from "@/lib/types";

type Audio = "sub" | "dub";
type Phase = "idle" | "loading" | "ready" | "empty" | "error";

function formatAiringDate(iso: string): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Mirrors pickDefaultServer in src/lib/streams.ts — the site's own HD-2-first order. */
function pickServer(servers: StreamServer[], audio: Audio): StreamServer | undefined {
  const matching = servers.filter((server) => server.audio === audio);
  const pool = matching.length > 0 ? matching : servers;
  return pool.find((server) => server.serverName === "HD-2") ?? pool[0];
}

export function WatchHerePlayer({
  malId,
  episodeCount,
  upcomingEpisode,
  airingAt,
}: {
  malId: number;
  /** Episodes that have actually aired — not the planned run. */
  episodeCount: number;
  upcomingEpisode?: number;
  /** ISO 8601 UTC timestamp for `upcomingEpisode`. */
  airingAt?: string;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [episode, setEpisode] = useState(1);
  const [audio, setAudio] = useState<Audio>("sub");
  const [sources, setSources] = useState<StreamSources | null>(null);
  const [serverId, setServerId] = useState<string>();

  // Lets a slow request for an abandoned episode be discarded instead of overwriting
  // the one the user has since selected.
  const requestIdRef = useRef(0);

  const load = useCallback(async (targetEpisode: number) => {
    const requestId = ++requestIdRef.current;
    setEpisode(targetEpisode);
    setPhase("loading");
    setSources(null);
    setServerId(undefined);

    try {
      const result = await loadStreamSources(malId, targetEpisode);
      if (requestIdRef.current !== requestId) return;

      if (result.status !== "ok") {
        setPhase(result.status === "error" ? "error" : "empty");
        return;
      }
      setSources(result.sources);
      setPhase("ready");
    } catch {
      if (requestIdRef.current !== requestId) return;
      setPhase("error");
    }
  }, [malId]);

  const servers = sources?.servers ?? [];
  const active = servers.find((server) => server.id === serverId) ?? pickServer(servers, audio);
  const hasDub = servers.some((server) => server.audio === "dub");
  const hasSub = servers.some((server) => server.audio === "sub");

  const episodes = Array.from({ length: Math.max(episodeCount, 0) }, (_, i) => i + 1);
  const nextAirsLabel = airingAt ? formatAiringDate(airingAt) : null;

  if (episodeCount < 1) {
    return (
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-foreground sm:text-xl">Watch here</h2>
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-surface px-4 py-10 text-center">
          <CalendarClock className="size-5 text-muted" />
          <p className="text-sm text-muted">
            {nextAirsLabel
              ? `No episodes have aired yet. Episode ${upcomingEpisode} airs ${nextAirsLabel}.`
              : "No episodes have aired yet."}
          </p>
        </div>
      </section>
    );
  }

  if (phase === "idle") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface px-4 py-8 text-center">
        <p className="text-sm text-muted">Prefer not to leave the app?</p>
        <Button size="lg" onClick={() => void load(episode)}>
          <Play className="size-4" /> Watch here
        </Button>
        <p className="max-w-sm text-xs text-muted">
          Plays from a third-party source that is not affiliated with MyAnimeList or the rights holders.
        </p>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-foreground sm:text-xl">Watch here</h2>
        {(hasSub || hasDub) && (
          <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-0.5">
            {(["sub", "dub"] as const).map((option) => (
              <button
                key={option}
                type="button"
                disabled={option === "sub" ? !hasSub : !hasDub}
                onClick={() => {
                  setAudio(option);
                  setServerId(undefined);
                }}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-semibold uppercase transition-colors disabled:opacity-40",
                  audio === option ? "bg-primary text-primary-foreground" : "text-muted hover:text-foreground",
                )}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-surface-muted">
        {phase === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted" />
          </div>
        )}

        {/*
          No `sandbox` here: the embed is an ArtPlayer/hls.js page that reads
          `localStorage` while initialising, and a sandboxed frame gets an opaque origin
          where that read throws a SecurityError, so playback never starts. That is why
          the same URL plays in a normal tab but stayed blank in the app. `referrerPolicy`
          is likewise left at the default, so the CDN's hotlink checks still see an origin.
        */}
        {phase === "ready" && active && (
          <iframe
            key={active.embedUrl}
            src={active.embedUrl}
            title={`Episode ${episode}`}
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        )}

        {(phase === "empty" || phase === "error") && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
            <AlertTriangle className="size-5 text-muted" />
            <p className="text-sm text-muted">
              {phase === "error"
                ? "Couldn't reach the stream source. Try again in a moment."
                : `No source found for episode ${episode}.`}
            </p>
            <Button variant="outline" size="sm" onClick={() => void load(episode)}>
              Retry
            </Button>
          </div>
        )}
      </div>

      {servers.length > 1 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {servers
            .filter((server) => server.audio === audio)
            .map((server) => (
              <Button
                key={server.id}
                variant={active?.id === server.id ? "default" : "outline"}
                size="sm"
                onClick={() => setServerId(server.id)}
              >
                {server.serverName}
              </Button>
            ))}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-foreground">Episodes</p>
        <div className="flex flex-wrap gap-1.5">
          {episodes.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => void load(n)}
              className={cn(
                "h-8 min-w-8 rounded-lg border px-2 text-xs font-semibold transition-colors",
                n === episode
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-border bg-surface text-muted hover:bg-surface-muted hover:text-foreground",
              )}
            >
              {n}
            </button>
          ))}
        </div>
        {upcomingEpisode !== undefined && upcomingEpisode > episodeCount && (
          <p className="text-xs text-muted">
            {nextAirsLabel
              ? `Episode ${upcomingEpisode} airs ${nextAirsLabel}.`
              : `Episode ${upcomingEpisode} hasn't aired yet.`}
          </p>
        )}
      </div>

      <p className="text-xs text-muted">
        Streams come from a third-party source unaffiliated with MyAnimeList and the rights holders.
        Availability and quality are outside this app&apos;s control.
      </p>
    </section>
  );
}
