"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <h1 className="text-2xl font-extrabold text-danger">Something went wrong</h1>
      <p className="max-w-md text-sm text-muted">
        {error.message || "An unexpected error occurred while talking to myanilist-server."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground"
      >
        Try again
      </button>
    </div>
  );
}
