"use server";

import { getAnimeList, getAnimeRelations } from "./api";
import {
  BROAD_RELATION_TYPES,
  STRICT_RELATION_TYPES,
  findNewRelations,
  mergeSuggestions,
  selectScannableEntries,
  type ScanChunkResult,
  type ScanPlan,
  type ScanTarget,
} from "./sequels";
import type { AnimeNode, MyListEntryStatus } from "./types";

// One list entry = one detail request, against a rate-limited API. Three levers keep that
// sane: only scan started titles (selectScannableEntries), fetch a 3-field payload that
// Next caches for a day (getAnimeRelations), and walk the list in bounded-concurrency
// chunks so a 300-entry list doesn't open 300 sockets at once.
const CONCURRENCY = 6;

/** Cheap first call: one list read that tells the client how much work there is. */
export async function planSequelScanAction(): Promise<ScanPlan> {
  const { data } = await getAnimeList();

  const statusById: Record<number, MyListEntryStatus> = {};
  for (const { node, list_status } of data) {
    if (list_status?.status) statusById[node.id] = list_status.status;
  }

  return {
    targets: selectScannableEntries(data).map(({ node }) => ({ id: node.id, title: node.title })),
    onList: data.map(({ node }) => node.id),
    statusById,
  };
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;

  async function run() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

/**
 * Scans one slice of the user's list. Called repeatedly by the client so results and
 * progress stream in rather than blocking on the whole list.
 */
export async function scanSequelChunkAction(
  targets: ScanTarget[],
  onList: number[],
  includeSideStories: boolean,
): Promise<ScanChunkResult> {
  const onListSet = new Set(onList);
  const allowed = includeSideStories ? BROAD_RELATION_TYPES : STRICT_RELATION_TYPES;

  let failed = 0;

  const settled = await mapWithConcurrency(targets, CONCURRENCY, async (target) => {
    try {
      return await getAnimeRelations(target.id);
    } catch {
      // A single unreachable title must not abort the whole scan.
      failed += 1;
      return undefined;
    }
  });

  const hits = settled
    .filter((node): node is AnimeNode => node !== undefined)
    .map((node) => ({ source: node, found: findNewRelations(node, onListSet, allowed) }))
    .filter((hit) => hit.found.length > 0);

  return { suggestions: mergeSuggestions(hits), failed };
}
