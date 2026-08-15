"use client";

import Link from "next/link";
import { useCallback, useSyncExternalStore, type ReactNode } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaCarouselType } from "embla-carousel";

function useCanScroll(emblaApi: EmblaCarouselType | undefined) {
  const subscribe = useCallback(
    (callback: () => void) => {
      if (!emblaApi) return () => {};
      emblaApi.on("select", callback);
      emblaApi.on("reInit", callback);
      return () => {
        emblaApi.off("select", callback);
        emblaApi.off("reInit", callback);
      };
    },
    [emblaApi],
  );

  const canPrev = useSyncExternalStore(subscribe, () => emblaApi?.canScrollPrev() ?? false, () => false);
  const canNext = useSyncExternalStore(subscribe, () => emblaApi?.canScrollNext() ?? false, () => false);
  return { canPrev, canNext };
}

function ArrowButton({ direction, onClick, disabled }: { direction: "prev" | "next"; onClick: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "Scroll left" : "Scroll right"}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/60 bg-surface text-foreground shadow-sm transition-all hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-30"
    >
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d={direction === "prev" ? "M12 4l-6 6 6 6" : "M8 4l6 6-6 6"} />
      </svg>
    </button>
  );
}

export function MediaRow({
  title,
  viewAllHref,
  children,
}: {
  title: string;
  viewAllHref?: string;
  children: ReactNode;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
  });
  const { canPrev, canNext } = useCanScroll(emblaApi);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-foreground sm:text-xl">{title}</h2>
        <div className="flex items-center gap-2">
          {viewAllHref && (
            <Link href={viewAllHref} className="text-sm font-medium text-accent hover:underline">
              View all →
            </Link>
          )}
          <div className="hidden items-center gap-1.5 sm:flex">
            <ArrowButton direction="prev" onClick={() => emblaApi?.scrollPrev()} disabled={!canPrev} />
            <ArrowButton direction="next" onClick={() => emblaApi?.scrollNext()} disabled={!canNext} />
          </div>
        </div>
      </div>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-3 sm:gap-4">{children}</div>
      </div>
    </section>
  );
}

export function MediaRowItem({ children }: { children: ReactNode }) {
  return <div className="w-32.5 shrink-0 sm:w-40 md:w-45">{children}</div>;
}
