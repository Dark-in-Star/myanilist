"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchBar({
  onNavigate,
  autoFocus,
}: {
  onNavigate?: () => void;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    onNavigate?.();
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <Input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search anime or manga..."
        autoFocus={autoFocus}
        className="h-9 rounded-full border-border bg-surface-muted pr-9 placeholder:text-muted focus-visible:border-accent"
      />
      <Button
        type="submit"
        variant="ghost"
        size="icon-sm"
        aria-label="Search"
        className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full text-muted hover:text-accent"
      >
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
          <circle cx="9" cy="9" r="6" />
          <path strokeLinecap="round" d="M17 17l-3.5-3.5" />
        </svg>
      </Button>
    </form>
  );
}
