"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LogIn, LogOut, User, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/authActions";

export function MobileProfileSheet({
  isAuthenticated,
  pictureUrl,
  userName,
}: {
  isAuthenticated: boolean;
  pictureUrl?: string;
  userName?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!isAuthenticated) {
    return (
      <Button asChild type="button" variant="outline" size="icon" className="rounded-full lg:hidden" aria-label="Log in">
        <Link href="/auth/login">
          <LogIn className="h-4 w-4" />
        </Link>
      </Button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open account menu"
        aria-expanded={open}
        className="rounded-full transition-opacity hover:opacity-90 lg:hidden"
      >
        <Avatar className="border border-border/60">
          <AvatarImage src={pictureUrl} alt={userName ?? "Account"} />
          <AvatarFallback>
            <User className="h-5 w-5 text-muted" />
          </AvatarFallback>
        </Avatar>
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Close account menu"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-overlay backdrop-blur-sm"
            />
            <div className="absolute inset-0 flex flex-col bg-surface/90 backdrop-blur-2xl">
              <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
                <span className="text-sm font-semibold text-muted">Account</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-1 flex-col overflow-y-auto px-4 py-8">
                <div className="flex flex-col items-center gap-3 text-center">
                  <Avatar className="h-20 w-20 border border-border/60">
                    <AvatarImage src={pictureUrl} alt={userName ?? "Account"} />
                    <AvatarFallback>
                      <User className="h-8 w-8 text-muted" />
                    </AvatarFallback>
                  </Avatar>
                  {userName && <p className="text-lg font-bold">{userName}</p>}
                </div>

                <nav className="mt-8 flex flex-col gap-1">
                  <Link
                    href="/profile"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-3 text-center text-sm font-medium text-foreground hover:bg-surface-muted"
                  >
                    View Profile
                  </Link>
                </nav>
              </div>

              <div
                className="border-t border-border/60 px-4 pt-4"
                style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    void logoutAction();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-danger/30 bg-danger-soft px-4 py-3 text-sm font-semibold text-danger transition-colors hover:bg-danger/10"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
