"use client";

import type { ReactNode } from "react";
import useEmblaCarousel from "embla-carousel-react";

// Raw CSS overflow-x-auto is unreliable for touch-drag scrolling across real mobile
// browsers (inconsistent touch-action/overflow-axis handling, especially on iOS
// Safari). embla-carousel already proves out reliably for this in MediaRow, so the
// status tab row uses the same JS-driven drag mechanism instead of fighting CSS.
export function ScrollableTabRow({ children }: { children: ReactNode }) {
  const [emblaRef] = useEmblaCarousel({ align: "start", dragFree: true, containScroll: "trimSnaps" });

  return (
    <div className="-mx-3 overflow-hidden border-b border-border px-3 sm:mx-0 sm:px-0" ref={emblaRef}>
      <div className="flex gap-1 sm:gap-2">{children}</div>
    </div>
  );
}
