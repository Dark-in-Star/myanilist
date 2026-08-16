"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import clsx from "clsx";
import { AccountMenu } from "./AccountMenu";
import { MobileProfileSheet } from "./MobileProfileSheet";
import { MobileSearchToggle } from "./MobileSearchToggle";
import { SearchBar } from "./SearchBar";
import { ThemeToggle } from "./ThemeToggle";
import { NAV_LINKS, isNavLinkActive } from "./nav-links";

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
  const isHome = pathname === "/";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
      <div className="relative mx-auto flex h-14 max-w-7xl items-center gap-3 px-3 sm:h-16 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center">
          <Image src="/brand.webp" alt="MyAniList" width={707} height={353} priority className="h-10 w-auto sm:h-12" />
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isNavLinkActive(pathname, link.href)
                  ? "bg-accent-soft text-accent"
                  : "text-muted hover:bg-surface-muted hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          {!isHome && (
            <div className="hidden sm:block sm:w-40 lg:w-56">
              <Suspense fallback={<div className="h-9 w-full rounded-full bg-surface-muted" />}>
                <SearchBar />
              </Suspense>
            </div>
          )}

          <ThemeToggle />

          <AccountMenu isAuthenticated={isAuthenticated} pictureUrl={pictureUrl} userName={userName} />

          {!isHome && <MobileSearchToggle />}

          <MobileProfileSheet isAuthenticated={isAuthenticated} pictureUrl={pictureUrl} userName={userName} />
        </div>
      </div>
    </header>
  );
}
