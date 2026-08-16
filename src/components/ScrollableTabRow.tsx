"use client";

import type { ReactNode } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";

// Raw CSS overflow-x-auto is unreliable for touch-drag scrolling across real mobile
// browsers (inconsistent touch-action/overflow-axis handling, especially on iOS
// Safari). embla-carousel already proves out reliably for this in MediaRow, so
// horizontally scrollable rows use the same JS-driven drag mechanism instead of
// fighting CSS.
export function ScrollableTabRow({
  children,
  className,
  innerClassName,
}: {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  const [emblaRef] = useEmblaCarousel({ align: "start", dragFree: true, containScroll: "trimSnaps" });

  return (
    <div className={cn("overflow-hidden", className)} ref={emblaRef}>
      <div className={cn("flex gap-1 sm:gap-2", innerClassName)}>{children}</div>
    </div>
  );
}
