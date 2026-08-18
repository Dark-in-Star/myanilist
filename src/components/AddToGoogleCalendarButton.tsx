"use client";

import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateGoogleCalendarUrl } from "@/lib/googleCalendar";
import type { AnimeNode, NextAiringEpisode } from "@/lib/types";

const DEFAULT_EPISODE_DURATION_SECONDS = 30 * 60;
/** Assumed total episode count for airing anime whose MAL entry doesn't list one yet. */
const DEFAULT_TOTAL_EPISODES = 13;

interface AddToGoogleCalendarButtonProps {
  anime: Pick<AnimeNode, "title" | "alternative_titles" | "num_episodes" | "average_episode_duration">;
  nextEpisode: NextAiringEpisode;
}

export function AddToGoogleCalendarButton({ anime, nextEpisode }: AddToGoogleCalendarButtonProps) {
  function handleClick() {
    // Prefer the English title where MAL has one, falling back to the original (often romaji) title.
    const displayTitle = anime.alternative_titles?.en || anime.title;

    const startDate = new Date(nextEpisode.airingAt);
    const durationMs = (anime.average_episode_duration ?? DEFAULT_EPISODE_DURATION_SECONDS) * 1000;
    const endDate = new Date(startDate.getTime() + durationMs);

    const totalEpisodes = anime.num_episodes ?? DEFAULT_TOTAL_EPISODES;
    // Episodes still to air, including the upcoming one, so the recurring event stops once the show wraps.
    const episodesRemaining = Math.max(1, totalEpisodes - nextEpisode.episode + 1);

    // No episode number here: this is a recurring weekly event, so a fixed episode
    // number would go stale (and be misleading) on every occurrence after the first.
    const anilistUrl = `https://anilist.co/anime/${nextEpisode.anilistId}`;
    const description = [displayTitle, "New episode airs today.", "", `More details: ${anilistUrl}`].join("\n");

    const calendarUrl = generateGoogleCalendarUrl({
      title: displayTitle,
      description,
      startDate,
      endDate,
      repeatType: "weekly",
      repeatCount: episodesRemaining,
    });

    window.open(calendarUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleClick} className="w-full justify-center gap-1.5">
      <CalendarPlus className="size-3.5" />
      Add to Google Calendar
    </Button>
  );
}
