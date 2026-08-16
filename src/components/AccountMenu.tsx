"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutAction } from "@/lib/authActions";

export function AccountMenu({
  isAuthenticated,
  pictureUrl,
  userName,
}: {
  isAuthenticated: boolean;
  pictureUrl?: string;
  userName?: string;
}) {
  const pathname = usePathname();

  if (!isAuthenticated) {
    return (
      <Button asChild className="hidden lg:inline-flex">
        <Link href={`/auth/login?returnTo=${encodeURIComponent(pathname)}`}>Log In</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className="hidden rounded-full transition-colors hover:opacity-90 lg:block"
        >
          <Avatar className="border border-border/60">
            <AvatarImage src={pictureUrl} alt={userName ?? "Account"} />
            <AvatarFallback>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 text-muted">
                <circle cx="12" cy="8" r="3.5" />
                <path strokeLinecap="round" d="M5 20c1.5-3.5 4.5-5.5 7-5.5s5.5 2 7 5.5" />
              </svg>
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem asChild>
          <Link href="/profile">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onSelect={(event) => {
            event.preventDefault();
            void logoutAction();
          }}
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
