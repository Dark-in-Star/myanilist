export interface MainPicture {
  medium: string;
  large?: string;
}

export interface AlternativeTitles {
  synonyms?: string[];
  en?: string;
  ja?: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Studio {
  id: number;
  name: string;
}

export interface StartSeason {
  year: number;
  season: "winter" | "spring" | "summer" | "fall";
}

export interface Broadcast {
  day_of_the_week: string;
  start_time?: string;
}

/** Next-episode airing schedule, sourced from AniList (MAL doesn't expose exact air dates). */
export interface NextAiringEpisode {
  episode: number;
  /** ISO 8601 UTC timestamp. */
  airingAt: string;
  /** Seconds until airing, as of when this was fetched — use `airingAt` for a live countdown instead. */
  timeUntilAiring: number;
}

export type AnimeStatus = "finished_airing" | "currently_airing" | "not_yet_aired";
export type MangaStatus = "finished" | "currently_publishing" | "not_yet_published" | "on_hiatus";

export type ListStatus = "watching" | "completed" | "on_hold" | "dropped" | "plan_to_watch";
export type MangaListStatus = "reading" | "completed" | "on_hold" | "dropped" | "plan_to_read";

export interface MyListStatus {
  status?: ListStatus;
  score: number;
  num_episodes_watched?: number;
  is_rewatching?: boolean;
  updated_at?: string;
}

export interface MyMangaListStatusNode {
  status?: MangaListStatus;
  score: number;
  num_volumes_read?: number;
  num_chapters_read?: number;
  is_rereading?: boolean;
  updated_at?: string;
}

export interface AnimeNode {
  id: number;
  title: string;
  main_picture?: MainPicture;
  alternative_titles?: AlternativeTitles;
  synopsis?: string;
  mean?: number;
  rank?: number;
  popularity?: number;
  num_list_users?: number;
  num_scoring_users?: number;
  nsfw?: string;
  media_type?: string;
  status?: AnimeStatus;
  genres?: Genre[];
  num_episodes?: number;
  start_season?: StartSeason;
  broadcast?: Broadcast;
  source?: string;
  average_episode_duration?: number;
  rating?: string;
  studios?: Studio[];
  start_date?: string;
  end_date?: string;
  my_list_status?: MyListStatus;
  related_anime?: RelatedAnime[];
  recommendations?: RecommendationNode[];
  background?: string;
  pictures?: MainPicture[];
}

export interface RelatedAnime {
  node: AnimeNode;
  relation_type: string;
  relation_type_formatted: string;
}

export interface RecommendationNode {
  node: AnimeNode | MangaNode;
  num_recommendations: number;
}

export interface MangaNode {
  id: number;
  title: string;
  main_picture?: MainPicture;
  alternative_titles?: AlternativeTitles;
  synopsis?: string;
  mean?: number;
  rank?: number;
  popularity?: number;
  num_list_users?: number;
  num_scoring_users?: number;
  nsfw?: string;
  media_type?: string;
  status?: MangaStatus;
  genres?: Genre[];
  num_volumes?: number;
  num_chapters?: number;
  authors?: { node: { id: number; first_name: string; last_name: string }; role: string }[];
  start_date?: string;
  end_date?: string;
  my_list_status?: MyMangaListStatusNode;
  related_manga?: { node: MangaNode; relation_type: string; relation_type_formatted: string }[];
  recommendations?: RecommendationNode[];
  background?: string;
  pictures?: MainPicture[];
}

export interface MalPaging {
  next?: string;
  previous?: string;
}

export interface MalListResponse<T> {
  data: T[];
  paging?: MalPaging;
}

export interface RankingNode<T> {
  node: T;
  ranking: { rank: number };
}

export interface ListNode<T, S> {
  node: T;
  list_status: S;
}

export type AnimeRankingType =
  | "all"
  | "airing"
  | "upcoming"
  | "tv"
  | "ova"
  | "movie"
  | "special"
  | "bypopularity"
  | "favorite";

export type MangaRankingType =
  | "all"
  | "manga"
  | "novels"
  | "oneshots"
  | "doujin"
  | "manhwa"
  | "manhua"
  | "bypopularity"
  | "favorite";

export type AnimeSeason = "winter" | "spring" | "summer" | "fall";
export type AnimeSeasonSort = "anime_score" | "anime_num_list_users";

export interface AnimeStatistics {
  num_items_watching: number;
  num_items_completed: number;
  num_items_on_hold: number;
  num_items_dropped: number;
  num_items_plan_to_watch: number;
  num_items: number;
  num_days_watched: number;
  num_days_watching: number;
  num_days_completed: number;
  num_days_on_hold: number;
  num_days_dropped: number;
  num_days: number;
  num_episodes: number;
  num_times_rewatched: number;
  mean_score: number;
}

export interface MalUser {
  id: number;
  name: string;
  picture?: string;
  gender?: string;
  birthday?: string;
  location?: string;
  joined_at?: string;
  anime_statistics?: AnimeStatistics;
}

export interface MalErrorResponse {
  error: string;
  message?: string;
}
