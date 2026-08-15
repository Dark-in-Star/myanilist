"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import clsx from "clsx";
import { SearchBar } from "./SearchBar";

const LINKS = [
  { href: "/anime", label: "Anime" },
  { href: "/manga", label: "Manga" },
  { href: "/mylist/anime", label: "My Anime List" },
  { href: "/mylist/manga", label: "My Manga List" },
];

export function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-3 sm:h-16 sm:px-6">
        <Link href="/" className="flex items-center">
          <Image src="/brand.webp" alt="MyAniList" width={707} height={353} priority className="h-7 w-auto sm:h-8" />
        </Link>

        <nav className="ml-2 hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname.startsWith(link.href)
                  ? "bg-accent-soft text-accent"
                  : "text-muted hover:bg-surface-muted hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden flex-1 justify-end sm:flex lg:max-w-xs">
          <Suspense fallback={<div className="h-9 w-full rounded-full bg-surface-muted" />}>
            <SearchBar />
          </Suspense>
        </div>

        <Link
          href="/profile"
          className="hidden rounded-md px-3 py-2 text-sm font-medium text-muted hover:bg-surface-muted hover:text-foreground lg:block"
        >
          Profile
        </Link>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="ml-auto flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground lg:hidden"
        >
          {open ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
      </div>

      {open && (
        <div className="border-t border-border px-3 pb-4 pt-3 lg:hidden">
          <div className="mb-3 sm:hidden">
            <Suspense fallback={<div className="h-9 w-full rounded-full bg-surface-muted" />}>
              <SearchBar onNavigate={() => setOpen(false)} />
            </Suspense>
          </div>
          <nav className="flex flex-col gap-1">
            {[...LINKS, { href: "/profile", label: "Profile" }].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={clsx(
                  "rounded-md px-3 py-2.5 text-sm font-medium",
                  pathname.startsWith(link.href)
                    ? "bg-accent-soft text-accent"
                    : "text-muted hover:bg-surface-muted hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
