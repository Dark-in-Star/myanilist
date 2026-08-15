"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function RevealList({ items, pageSize = 60 }: { items: ReactNode[]; pageSize?: number }) {
  const [count, setCount] = useState(pageSize);
  const visible = items.slice(0, count);
  const remaining = items.length - count;

  return (
    <>
      <div className="flex flex-col gap-2.5">{visible}</div>
      {remaining > 0 && (
        <div className="flex justify-center py-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCount((c) => c + pageSize)}
            className="h-auto rounded-full border-border/60 px-6 py-2.5 text-sm font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:text-accent hover:shadow-md active:translate-y-0"
          >
            Show more ({remaining} remaining)
          </Button>
        </div>
      )}
    </>
  );
}
