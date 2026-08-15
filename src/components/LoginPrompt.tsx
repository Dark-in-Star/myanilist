import Link from "next/link";

export function LoginPrompt({ description }: { description: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
      <p className="text-base font-semibold text-foreground">Log in with MyAnimeList</p>
      <p className="max-w-sm text-sm text-muted">{description}</p>
      <Link
        href="/auth/login"
        className="mt-1 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground shadow-sm transition-transform hover:-translate-y-0.5"
      >
        Log in with MyAnimeList
      </Link>
    </div>
  );
}
