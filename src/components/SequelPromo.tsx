"use client";

import Link from "next/link";
import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Below this there isn't enough watch history for a scan to find anything interesting. */
const MIN_ENTRIES = 5;

export function SequelPromo({ scannableCount }: { scannableCount: number }) {
  // Dismissal is deliberately not persisted — the banner comes back on every visit and
  // refresh. The scan turns up new results over time as sequels get announced, and on
  // mobile the toolbar entry point is icon-only, so a remembered dismissal would quietly
  // remove the only visible route to the feature. The × just clears it for this view.
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || scannableCount < MIN_ENTRIES) return null;

  return (
    <div className="relative mx-4 sm:mx-0 flex flex-wrap items-center gap-3 rounded-2xl border border-accent/30 bg-accent-soft px-4 py-3.5 pr-11">
      <Sparkles className="size-5 shrink-0 text-accent" />
      <p className="flex-1 text-sm text-foreground">
        Scan the <strong className="font-semibold">{scannableCount}</strong> anime on my list for sequels that
        aren&apos;t on my list yet.
      </p>
      <Button asChild size="sm" className="shrink-0">
        <Link href="/mylist/sequels">Find them</Link>
      </Button>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
