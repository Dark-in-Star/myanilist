import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError, getAnime } from "@/lib/api";
import { getSession } from "@/lib/session";
import { ScoreBadge } from "@/components/ScoreBadge";
import { InfoRow } from "@/components/InfoRow";
import { GenreTags } from "@/components/GenreTags";
import { AnimeListStatusEditor } from "@/components/AnimeListStatusEditor";
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
  const [anime, session] = await Promise.all([loadAnime(Number(id)), getSession()]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="mx-auto w-40 shrink-0 sm:w-52 md:mx-0">
          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl border border-border bg-surface-muted">
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

          <GenreTags genres={anime.genres} />

          {anime.synopsis && <p className="max-w-3xl whitespace-pre-line text-sm leading-relaxed text-foreground">{anime.synopsis}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="order-2 flex flex-col gap-4 lg:order-1">
          <AnimeListStatusEditor
            animeId={anime.id}
            numEpisodes={anime.num_episodes}
            initial={anime.my_list_status}
            isAuthenticated={Boolean(session)}
          />

          <dl className="divide-y divide-border rounded-xl border border-border bg-surface px-4">
            <InfoRow label="Type">{formatMediaType(anime.media_type)}</InfoRow>
            <InfoRow label="Episodes">{anime.num_episodes || "Unknown"}</InfoRow>
            <InfoRow label="Aired">{formatDateRange(anime.start_date, anime.end_date)}</InfoRow>
            {anime.start_season && (
              <InfoRow label="Season">
                {anime.start_season.season} {anime.start_season.year}
              </InfoRow>
            )}
            <InfoRow label="Source">{anime.source ? formatMediaType(anime.source) : "Unknown"}</InfoRow>
            {anime.average_episode_duration && (
              <InfoRow label="Duration">{Math.round(anime.average_episode_duration / 60)} min / ep</InfoRow>
            )}
            <InfoRow label="Rating">{anime.rating?.toUpperCase() ?? "Unknown"}</InfoRow>
            {anime.studios && anime.studios.length > 0 && (
              <InfoRow label="Studios">{anime.studios.map((s) => s.name).join(", ")}</InfoRow>
            )}
            <InfoRow label="Members">{formatCompactNumber(anime.num_list_users)}</InfoRow>
            <InfoRow label="Scored by">{formatCompactNumber(anime.num_scoring_users)} users</InfoRow>
          </dl>
        </aside>

        <div className="order-1 flex flex-col gap-8 lg:order-2">
          {anime.related_anime && anime.related_anime.length > 0 && (
            <MediaRow title="Related Anime">
              {anime.related_anime.map((rel) => (
                <MediaRowItem key={rel.node.id}>
                  <MediaCard
                    href={`/anime/${rel.node.id}`}
                    title={rel.node.title}
                    imageUrl={rel.node.main_picture?.large ?? rel.node.main_picture?.medium}
                    mean={rel.node.mean}
                    subtitle={rel.relation_type_formatted}
                  />
                </MediaRowItem>
              ))}
            </MediaRow>
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
      </div>

      <Link href="/anime" className="text-sm font-medium text-accent hover:underline">
        ← Back to rankings
      </Link>
    </div>
  );
}
