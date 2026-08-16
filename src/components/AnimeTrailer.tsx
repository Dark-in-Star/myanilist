import type { AnimeTrailer as AnimeTrailerData } from "@/lib/types";

export function AnimeTrailer({ trailer }: { trailer: AnimeTrailerData }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-bold text-foreground sm:text-xl">Trailer</h2>
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-surface-muted">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${trailer.id}`}
          title="Trailer"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    </section>
  );
}
