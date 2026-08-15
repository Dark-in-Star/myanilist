"use client";

import { useState, type ReactNode } from "react";

export function RevealList({ items, pageSize = 60 }: { items: ReactNode[]; pageSize?: number }) {
  const [count, setCount] = useState(pageSize);
  const visible = items.slice(0, count);
  const remaining = items.length - count;

  return (
    <>
      <div className="flex flex-col gap-2.5">{visible}</div>
      {remaining > 0 && (
        <div className="flex justify-center py-6">
          <button
            type="button"
            onClick={() => setCount((c) => c + pageSize)}
            className="rounded-full border border-border/60 bg-surface px-6 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:text-accent hover:shadow-md active:translate-y-0"
          >
            Show more ({remaining} remaining)
          </button>
        </div>
      )}
    </>
  );
}
