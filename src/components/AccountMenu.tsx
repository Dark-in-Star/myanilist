"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

export function AccountMenu({
  isAuthenticated,
  pictureUrl,
  userName,
}: {
  isAuthenticated: boolean;
  pictureUrl?: string;
  userName?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  if (!isAuthenticated) {
    return (
      <Link
        href="/auth/login"
        className="hidden rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 lg:block"
      >
        Log In
      </Link>
    );
  }

  return (
    <div ref={containerRef} className="relative hidden lg:block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border/60 bg-surface-muted transition-colors hover:border-accent"
      >
        {pictureUrl ? (
          <Image src={pictureUrl} alt={userName ?? "Account"} width={36} height={36} className="h-full w-full object-cover" />
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 text-muted">
            <circle cx="12" cy="8" r="3.5" />
            <path strokeLinecap="round" d="M5 20c1.5-3.5 4.5-5.5 7-5.5s5.5 2 7 5.5" />
          </svg>
        )}
      </button>

      <div
        role="menu"
        className={clsx(
          "absolute right-0 mt-2 w-44 origin-top-right rounded-xl border border-border/60 bg-surface p-1.5 shadow-lg transition-all duration-150",
          open ? "visible scale-100 opacity-100" : "invisible scale-95 opacity-0",
        )}
      >
        <Link
          href="/profile"
          role="menuitem"
          onClick={() => setOpen(false)}
          className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-muted"
        >
          Profile
        </Link>
        <Link
          href="/auth/logout"
          role="menuitem"
          onClick={() => setOpen(false)}
          className="block rounded-lg px-3 py-2 text-sm font-medium text-danger hover:bg-danger-soft"
        >
          Log out
        </Link>
      </div>
    </div>
  );
}
