"use server";

import { getStreamSources } from "./streams";
import type { StreamSources } from "./types";

export async function loadStreamSources(malId: number, episode: number): Promise<StreamSources | null> {
  if (!Number.isInteger(malId) || malId <= 0) return null;
  if (!Number.isInteger(episode) || episode <= 0) return null;
  return getStreamSources(malId, episode);
}
