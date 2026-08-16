import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Genre } from "./types";

// The genre list for a given ranking type is derived from a wide (500-item) live MAL
// sample (see browse/page.tsx) — that's a much bigger fetch than a normal page, and the
// result barely changes day to day, so it's worth persisting to disk and reusing across
// requests instead of re-fetching 500 items on every visit.
const CACHE_DIR = path.join(process.cwd(), ".cache", "genres");
const TTL_MS = 24 * 60 * 60 * 1000;

interface CacheEntry {
  genres: Genre[];
  cachedAt: number;
}

function cacheFilePath(key: string): string {
  const safeKey = key.replace(/[^a-z0-9_-]/gi, "_");
  return path.join(CACHE_DIR, `${safeKey}.json`);
}

/** Reads a JSON-cached genre list for `key` if it's still fresh, otherwise calls
 * `fetchFresh` and persists the result. Best-effort: a read-only filesystem or any other
 * disk error just falls back to fetching fresh every time rather than failing the page. */
export async function getCachedGenres(key: string, fetchFresh: () => Promise<Genre[]>): Promise<Genre[]> {
  const filePath = cacheFilePath(key);

  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const entry: CacheEntry = JSON.parse(raw);
    if (entry.genres.length > 0 && Date.now() - entry.cachedAt < TTL_MS) {
      return entry.genres;
    }
  } catch {
    // No cache yet, or unreadable/stale — fall through to fetch fresh.
  }

  const genres = await fetchFresh();

  if (genres.length > 0) {
    try {
      await fs.mkdir(CACHE_DIR, { recursive: true });
      const entry: CacheEntry = { genres, cachedAt: Date.now() };
      await fs.writeFile(filePath, JSON.stringify(entry));
    } catch {
      // Best-effort cache write only.
    }
  }

  return genres;
}
