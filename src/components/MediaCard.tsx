import Image from "next/image";
import Link from "next/link";
import { formatMediaType } from "@/lib/format";
import { ScoreBadge } from "./ScoreBadge";

interface MediaCardProps {
  href: string;
  title: string;
  imageUrl?: string;
  mean?: number;
  mediaType?: string;
  rank?: number;
  subtitle?: string;
  priority?: boolean;
}

export function MediaCard({ href, title, imageUrl, mean, mediaType, rank, subtitle, priority }: MediaCardProps) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-surface shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-accent/40 hover:shadow-glow"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-surface-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 15vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            priority={priority}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted">No image</div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/60 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        {rank !== undefined && (
          <span className="absolute left-2 top-2 rounded-lg bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground shadow-sm">
            #{rank}
          </span>
        )}
        <div className="absolute bottom-2 left-2">
          <ScoreBadge mean={mean} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-accent">
          {title}
        </h3>
        <p className="mt-auto text-xs text-muted">{subtitle ?? formatMediaType(mediaType)}</p>
      </div>
    </Link>
  );
}
