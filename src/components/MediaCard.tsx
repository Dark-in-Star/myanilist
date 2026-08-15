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
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-surface-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 15vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={priority}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted">No image</div>
        )}
        {rank !== undefined && (
          <span className="absolute left-2 top-2 rounded-md bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground shadow">
            #{rank}
          </span>
        )}
        <div className="absolute bottom-2 left-2">
          <ScoreBadge mean={mean} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-2.5">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-accent">
          {title}
        </h3>
        <p className="text-xs text-muted">{subtitle ?? formatMediaType(mediaType)}</p>
      </div>
    </Link>
  );
}
