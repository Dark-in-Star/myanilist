import Link from "next/link";

export function LoadMoreLink({ href, hasMore }: { href: string; hasMore: boolean }) {
  if (!hasMore) return null;
  return (
    <div className="flex justify-center py-6">
      <Link
        href={href}
        className="rounded-full border border-border bg-surface px-6 py-2.5 text-sm font-semibold text-foreground hover:border-accent hover:text-accent"
      >
        Load more
      </Link>
    </div>
  );
}
