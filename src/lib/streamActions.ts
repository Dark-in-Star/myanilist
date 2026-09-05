"use server";

import { getStreamSources } from "./streams";
import type { StreamSources } from "./types";

/**
 * Next redacts thrown Server Action errors to an opaque digest in production, so an
 * upstream failure has to come back as a value to stay distinguishable from an episode
 * that simply has no servers.
 */
export type StreamResult =
  | { status: "ok"; sources: StreamSources }
  | { status: "empty" }
  | { status: "error" };

export async function loadStreamSources(malId: number, episode: number): Promise<StreamResult> {
  if (!Number.isInteger(malId) || malId <= 0) return { status: "empty" };
  if (!Number.isInteger(episode) || episode <= 0) return { status: "empty" };

  try {
    const sources = await getStreamSources(malId, episode);
    return sources ? { status: "ok", sources } : { status: "empty" };
  } catch (error) {
    console.error("loadStreamSources failed", { malId, episode, error });
    return { status: "error" };
  }
}
