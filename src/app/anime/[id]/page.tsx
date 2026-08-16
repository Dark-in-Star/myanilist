import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Building2,
  CalendarDays,
  ChevronRight,
  Clock,
  ExternalLink,
  Layers,
  ListVideo,
  ShieldCheck,
  Star,
  Tv,
  Users,
} from "lucide-react";
import { ApiError, getAnime } from "@/lib/api";
import { getAnimeExtras, getNextAiringEpisode } from "@/lib/anilist";
import { getSession } from "@/lib/session";
import { sortRelatedAnime } from "@/lib/related";
import { ScoreBadge } from "@/components/ScoreBadge";
import { InfoRow } from "@/components/InfoRow";
import { GenreTags } from "@/components/GenreTags";
import { AnimeListStatusPanel } from "@/components/AnimeListStatusPanel";
import { AnimeTrailer } from "@/components/AnimeTrailer";
import { AnimeCharacters } from "@/components/AnimeCharacters";
import { AnimeStaff } from "@/components/AnimeStaff";
import { NextEpisodeCountdown } from "@/components/NextEpisodeCountdown";
import { MediaRow, MediaRowItem } from "@/components/MediaRow";
import { MediaCard } from "@/components/MediaCard";
import {
  formatAnimeStatus,
  formatCompactNumber,
  formatDateRange,
  formatMediaType,
} from "@/lib/format";

async function loadAnime(id: number) {
  try {
    return await getAnime(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const anime = await loadAnime(Number(id));
  return { title: anime.title };
}

export default async function AnimeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [anime, session, nextEpisode, extras] = await Promise.all([
    loadAnime(Number(id)),
    getSession(),
    getNextAiringEpisode(Number(id)),
    getAnimeExtras(Number(id)),
  ]);

  const relatedAnime = sortRelatedAnime(anime.related_anime);
  const backdropUrl = anime.main_picture?.large ?? anime.main_picture?.medium;
  const hasExtrasContent = Boolean(extras?.trailer) || Boolean(extras?.characters.length) || Boolean(extras?.staff.length);

  const sidebar = (
    <>
      <AnimeListStatusPanel anime={anime} initial={anime.my_list_status} isAuthenticated={Boolean(session)} />

      <a
        href={`https://myanimelist.net/anime/${anime.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
      >
        <span className="flex items-center gap-2">
          <Tv className="size-4" /> Where to watch
        </span>
        <ExternalLink className="size-3.5 text-muted" />
      </a>

      {anime.status === "currently_airing" && nextEpisode && <NextEpisodeCountdown schedule={nextEpisode} />}

      {relatedAnime.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-muted">Related</h2>
          <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-surface lg:max-h-80 lg:overflow-y-auto">
            {relatedAnime.map((rel) => (
              <Link
                key={rel.node.id}
                href={`/anime/${rel.node.id}`}
                className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-surface-muted"
              >
                <span className="truncate">
                  <span className="font-semibold text-foreground">{rel.relation_type_formatted}</span>
                  <span className="text-muted"> - {rel.node.title}</span>
                </span>
                <ChevronRight className="size-3.5 shrink-0 text-muted" />
              </Link>
            ))}
          </div>
        </div>
      )}

      <dl className="divide-y divide-border rounded-xl border border-border bg-surface px-4">
        <InfoRow label="Type" icon={<Tv className="size-3.5" />}>
          {formatMediaType(anime.media_type)}
        </InfoRow>
        <InfoRow label="Episodes" icon={<ListVideo className="size-3.5" />}>
          {anime.num_episodes || "Unknown"}
        </InfoRow>
        <InfoRow label="Aired" icon={<CalendarDays className="size-3.5" />}>
          {formatDateRange(anime.start_date, anime.end_date)}
        </InfoRow>
        {anime.start_season && (
          <InfoRow label="Season" icon={<CalendarDays className="size-3.5" />}>
            {anime.start_season.season} {anime.start_season.year}
          </InfoRow>
        )}
        <InfoRow label="Source" icon={<Layers className="size-3.5" />}>
          {anime.source ? formatMediaType(anime.source) : "Unknown"}
        </InfoRow>
        {anime.average_episode_duration && (
          <InfoRow label="Duration" icon={<Clock className="size-3.5" />}>
            {Math.round(anime.average_episode_duration / 60)} min / ep
          </InfoRow>
        )}
        <InfoRow label="Rating" icon={<ShieldCheck className="size-3.5" />}>
          {anime.rating?.toUpperCase() ?? "Unknown"}
        </InfoRow>
        {anime.studios && anime.studios.length > 0 && (
          <InfoRow label="Studios" icon={<Building2 className="size-3.5" />}>
            {anime.studios.map((s) => s.name).join(", ")}
          </InfoRow>
        )}
        <InfoRow label="Members" icon={<Users className="size-3.5" />}>
          {formatCompactNumber(anime.num_list_users)}
        </InfoRow>
        <InfoRow label="Scored by" icon={<Star className="size-3.5" />}>
          {formatCompactNumber(anime.num_scoring_users)} users
        </InfoRow>
      </dl>
    </>
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface">
        {backdropUrl && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <Image
              src={backdropUrl}
              alt=""
              aria-hidden="true"
              fill
              sizes="100vw"
              className="scale-110 object-cover opacity-25 blur-3xl"
            />
            <div className="absolute inset-0 bg-linear-to-b from-surface/40 via-surface/85 to-surface" />
          </div>
        )}

        <div className="relative flex flex-col gap-6 p-4 sm:p-6 md:flex-row">
          <div className="mx-auto w-40 shrink-0 sm:w-52 md:mx-0">
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl border border-border bg-surface-muted shadow-lg">
              {anime.main_picture && (
                <Image
                  src={anime.main_picture.large ?? anime.main_picture.medium}
                  alt={anime.title}
                  fill
                  sizes="(max-width: 768px) 60vw, 208px"
                  className="object-cover"
                  priority
                />
              )}
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-extrabold sm:text-3xl">{anime.title}</h1>
              {anime.alternative_titles?.en && anime.alternative_titles.en !== anime.title && (
                <p className="text-sm text-muted">{anime.alternative_titles.en}</p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <ScoreBadge mean={anime.mean} size="lg" />
              {anime.rank !== undefined && (
                <span className="rounded-lg bg-surface-muted px-3 py-1.5 text-sm font-semibold text-foreground">
                  Rank #{anime.rank}
                </span>
              )}
              {anime.popularity !== undefined && (
                <span className="rounded-lg bg-surface-muted px-3 py-1.5 text-sm font-semibold text-foreground">
                  Popularity #{anime.popularity}
                </span>
              )}
              <span className="rounded-lg bg-surface-muted px-3 py-1.5 text-sm font-semibold text-foreground">
                {formatAnimeStatus(anime.status)}
              </span>
            </div>

            <p className="text-sm text-muted">
              {formatMediaType(anime.media_type)}
              {anime.num_episodes ? ` · ${anime.num_episodes} episodes` : ""}
              {anime.average_episode_duration
                ? ` · ${Math.round(anime.average_episode_duration / 60)} min/ep`
                : ""}
              {anime.studios && anime.studios.length > 0 ? ` · ${anime.studios.map((s) => s.name).join(", ")}` : ""}
            </p>

            <GenreTags genres={anime.genres} />

            {anime.synopsis && (
              <p className="max-w-3xl whitespace-pre-line text-sm leading-relaxed text-foreground">
                {anime.synopsis}
              </p>
            )}
          </div>
        </div>
      </div>

      {hasExtrasContent ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
          <aside className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-20">{sidebar}</aside>
          <div className="flex min-w-0 flex-col gap-8">
            {extras?.trailer && <AnimeTrailer trailer={extras.trailer} />}
            {extras && extras.characters.length > 0 && <AnimeCharacters characters={extras.characters} />}
            {extras && extras.staff.length > 0 && <AnimeStaff staff={extras.staff} />}
          </div>
        </div>
      ) : (
        <aside className="flex w-full flex-col gap-4 lg:max-w-70">{sidebar}</aside>
      )}

      {anime.recommendations && anime.recommendations.length > 0 && (
        <MediaRow title="Recommendations">
          {anime.recommendations.map((rec) => (
            <MediaRowItem key={rec.node.id}>
              <MediaCard
                href={`/anime/${rec.node.id}`}
                title={rec.node.title}
                imageUrl={rec.node.main_picture?.large ?? rec.node.main_picture?.medium}
                mean={rec.node.mean}
                mediaType={rec.node.media_type}
              />
            </MediaRowItem>
          ))}
        </MediaRow>
      )}
    </div>
  );
}
