"use client";

import { useRouter } from "next/navigation";
import clsx from "clsx";

const MEDIA_OPTIONS = [
  { value: "anime", label: "Anime" },
  { value: "manga", label: "Manga" },
] as const;

export function MediaTypeToggle({
  active,
  basePath = "/mylist",
  extraParams,
}: {
  active: "anime" | "manga";
  basePath?: string;
  extraParams?: Record<string, string>;
}) {
  const router = useRouter();

  return (
    <div role="group" aria-label="Media type" className="inline-flex shrink-0 gap-1 rounded-full border border-border/60 bg-surface p-1">
      {MEDIA_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === active}
          onClick={() => {
            const params = new URLSearchParams({ ...extraParams, media: option.value });
            router.push(`${basePath}?${params.toString()}`);
          }}
          className={clsx(
            "rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200",
            option.value === active
              ? "bg-accent text-accent-foreground shadow-sm shadow-accent/30"
              : "text-muted hover:text-accent",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
