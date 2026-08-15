import type { AnimeRankingType, AnimeStatus, MangaRankingType, MangaStatus } from "./types";

export function formatScore(mean?: number): string {
  return mean !== undefined ? mean.toFixed(2) : "N/A";
}

export function formatCompactNumber(value?: number): string {
  if (value === undefined) return "N/A";
  return new Intl.NumberFormat("en-US", { notation: "compact" }).format(value);
}

export function formatDate(value?: string): string {
  if (!value) return "Unknown";
  const parts = value.split("-");
  const date = new Date(Number(parts[0]), Number(parts[1] ?? 1) - 1, Number(parts[2] ?? 1));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: parts.length > 2 ? "numeric" : undefined,
  });
}

export function formatDateRange(start?: string, end?: string): string {
  if (!start && !end) return "Unknown";
  if (start && !end) return `${formatDate(start)} - ?`;
  if (start && end) return `${formatDate(start)} - ${formatDate(end)}`;
  return formatDate(end);
}

const ANIME_STATUS_LABELS: Record<AnimeStatus, string> = {
  finished_airing: "Finished Airing",
  currently_airing: "Currently Airing",
  not_yet_aired: "Not Yet Aired",
};

export function formatAnimeStatus(status?: AnimeStatus): string {
  return status ? (ANIME_STATUS_LABELS[status] ?? status) : "Unknown";
}

const MANGA_STATUS_LABELS: Record<MangaStatus, string> = {
  finished: "Finished",
  currently_publishing: "Publishing",
  not_yet_published: "Not Yet Published",
  on_hiatus: "On Hiatus",
};

export function formatMangaStatus(status?: MangaStatus): string {
  return status ? (MANGA_STATUS_LABELS[status] ?? status) : "Unknown";
}

export function formatMediaType(type?: string): string {
  if (!type) return "Unknown";
  return type.toUpperCase().replace(/_/g, " ");
}

export const ANIME_LIST_STATUS_LABELS: Record<string, string> = {
  watching: "Watching",
  completed: "Completed",
  on_hold: "On Hold",
  dropped: "Dropped",
  plan_to_watch: "Plan to Watch",
};

export const MANGA_LIST_STATUS_LABELS: Record<string, string> = {
  reading: "Reading",
  completed: "Completed",
  on_hold: "On Hold",
  dropped: "Dropped",
  plan_to_read: "Plan to Read",
};

export const ANIME_RANKING_TABS: { value: AnimeRankingType; label: string }[] = [
  { value: "all", label: "Top Anime" },
  { value: "airing", label: "Airing Now" },
  { value: "upcoming", label: "Upcoming" },
  { value: "tv", label: "TV" },
  { value: "ova", label: "OVA" },
  { value: "movie", label: "Movies" },
  { value: "special", label: "Specials" },
  { value: "bypopularity", label: "Popularity" },
  { value: "favorite", label: "Favorites" },
];

export const MANGA_RANKING_TABS: { value: MangaRankingType; label: string }[] = [
  { value: "all", label: "Top Manga" },
  { value: "manga", label: "Manga" },
  { value: "novels", label: "Novels" },
  { value: "oneshots", label: "One-shots" },
  { value: "doujin", label: "Doujin" },
  { value: "manhwa", label: "Manhwa" },
  { value: "manhua", label: "Manhua" },
  { value: "bypopularity", label: "Popularity" },
  { value: "favorite", label: "Favorites" },
];
