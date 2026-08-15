import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <h1 className="text-4xl font-extrabold text-accent">404</h1>
      <p className="text-base text-muted">We couldn&apos;t find what you were looking for.</p>
      <Link href="/" className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground">
        Back home
      </Link>
    </div>
  );
}
