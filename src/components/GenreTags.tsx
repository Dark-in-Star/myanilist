import type { Genre } from "@/lib/types";

export function GenreTags({ genres }: { genres?: Genre[] }) {
  if (!genres || genres.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {genres.map((genre) => (
        <span
          key={genre.id}
          className="rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent"
        >
          {genre.name}
        </span>
      ))}
    </div>
  );
}
