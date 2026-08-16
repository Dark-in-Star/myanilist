"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import clsx from "clsx";
import { AccountMenu } from "./AccountMenu";
import { SearchBar } from "./SearchBar";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse" },
  { href: "/archive", label: "Archive" },
  { href: "/mylist", label: "My List" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/browse") {
    return pathname.startsWith("/browse") || pathname.startsWith("/anime/") || pathname.startsWith("/manga/");
  }
  return pathname.startsWith(href);
}

export function NavBar({
  isAuthenticated,
  pictureUrl,
  userName,
}: {
  isAuthenticated: boolean;
  pictureUrl?: string;
  userName?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isHome = pathname === "/";

  const accountLink = isAuthenticated
    ? { href: "/profile", label: "Profile" }
    : { href: "/auth/login", label: "Log In" };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-3 sm:h-16 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center">
          <Image src="/brand.webp" alt="MyAniList" width={707} height={353} priority className="h-10 w-auto sm:h-12" />
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive(pathname, link.href)
                  ? "bg-accent-soft text-accent"
                  : "text-muted hover:bg-surface-muted hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-3">
          {!isHome && (
            <div className="hidden sm:block sm:w-40 lg:w-56">
              <Suspense fallback={<div className="h-9 w-full rounded-full bg-surface-muted" />}>
                <SearchBar />
              </Suspense>
            </div>
          )}

          <ThemeToggle />

          <AccountMenu isAuthenticated={isAuthenticated} pictureUrl={pictureUrl} userName={userName} />

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="rounded-md lg:hidden"
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
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border px-3 pb-4 pt-3 lg:hidden">
          {!isHome && (
            <div className="mb-3 sm:hidden">
              <Suspense fallback={<div className="h-9 w-full rounded-full bg-surface-muted" />}>
                <SearchBar onNavigate={() => setOpen(false)} />
              </Suspense>
            </div>
          )}
          <nav className="flex flex-col gap-1">
            {[...LINKS, accountLink].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={clsx(
                  "rounded-md px-3 py-2.5 text-sm font-medium",
                  isActive(pathname, link.href)
                    ? "bg-accent-soft text-accent"
                    : "text-muted hover:bg-surface-muted hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && (
              <Link
                href="/auth/logout"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-danger hover:bg-danger-soft"
              >
                Log out
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
