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
            className="rounded-full border border-border bg-surface px-6 py-2.5 text-sm font-semibold text-foreground hover:border-accent hover:text-accent"
          >
            Show more ({remaining} remaining)
          </button>
        </div>
      )}
    </>
  );
}
