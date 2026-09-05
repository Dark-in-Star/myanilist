"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { AnimeListEditModal } from "./AnimeListEditModal";
import { MangaListEditModal } from "./MangaListEditModal";
import type { AnimeNode, MangaNode, MyListStatus, MyMangaListStatusNode } from "@/lib/types";

export function MediaCardAddButton({
  id,
  title,
  mediaType,
  media,
  inList = false,
}: {
  id: number;
  title: string;
  mediaType?: string;
  media: "anime" | "manga";
  inList?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [added, setAdded] = useState(inList);
  // Remounts the modal per open so it re-derives its fields from a clean slate.
  const [session, setSession] = useState(0);

  const label = added ? `Edit ${title} in your list` : `Add ${title} to your list`;

  return (
    <>
      <button
        type="button"
        aria-label={label}
        title={label}
        data-testid={`media-card-add-${id}`}
        onClick={() => {
          setSession((s) => s + 1);
          setOpen(true);
        }}
        className="absolute right-2 bottom-2 z-10 inline-flex size-8 items-center justify-center rounded-full border border-white/25 bg-black/55 text-white shadow-sm backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:border-accent hover:bg-accent hover:text-accent-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none data-[added=true]:border-score/60 data-[added=true]:bg-score data-[added=true]:text-accent-foreground"
        data-added={added}
      >
        {added ? <Check className="size-4" /> : <Plus className="size-4" />}
      </button>

      {open &&
        (media === "anime" ? (
          <AnimeListEditModal
            key={session}
            node={{ id, title, media_type: mediaType } as AnimeNode}
            listStatus={{ score: 0 } as MyListStatus}
            isNew={!added}
            open={open}
            onOpenChange={setOpen}
            onSaved={() => setAdded(true)}
            onRemoved={() => setAdded(false)}
          />
        ) : (
          <MangaListEditModal
            key={session}
            node={{ id, title, media_type: mediaType } as MangaNode}
            listStatus={{ score: 0 } as MyMangaListStatusNode}
            open={open}
            onOpenChange={setOpen}
            onSaved={() => setAdded(true)}
            onRemoved={() => setAdded(false)}
          />
        ))}
    </>
  );
}
