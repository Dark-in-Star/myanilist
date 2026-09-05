import "server-only";
import { getAniListId } from "./anilist";
import type { StreamServer, StreamSources } from "./types";

/**
 * Signals that the upstream was unreachable or misbehaving, as distinct from an episode
 * that genuinely has no servers. Without the distinction every deployment-only network
 * failure surfaced to the user as the flatly wrong "No source found for episode N."
 */
export class StreamSourceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StreamSourceError";
  }
}

const FLIX_API_BASE_URL = process.env.FLIX_API_BASE_URL ?? "https://reanime.to/api/flix";

const FLIX_REFERER = "https://reanime.to/";
const FLIX_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

interface FlixServer {
  $id: string;
  serverName: string;
  dataLink: string;
  dataType: string;
}

interface FlixResponse {
  success?: boolean;
  servers?: FlixServer[];
}

// The flix endpoint is keyed on the AniList id, never the MAL id. A MAL id still
// returns HTTP 200 with `success: true` and an empty `servers` array, so neither
// `res.ok` nor `success` catches the mistake — it fails silently on roughly half the
// modern catalogue. See docs/flix-link-resolution.md.
export async function getStreamSources(
  malId: number,
  episode: number,
  revalidate = 1800,
): Promise<StreamSources | null> {
  const anilistId = await getAniListId(malId);
  // A missing id here is almost always an unreachable AniList rather than an unknown
  // title, and the two must not collapse into the same "no source" message.
  if (!anilistId) throw new StreamSourceError("Could not resolve the AniList id.");

  // The flix origin answers with `Cache-Control: no-store, no-cache, must-revalidate`.
  // Next refuses to populate the Data Cache for such a response, so `next: { revalidate }`
  // silently degrades to an uncached request on every call. `cache: "force-cache"` plus an
  // explicit revalidate overrides the origin's header and restores the intended caching.
  let response: Response;
  try {
    response = await fetch(`${FLIX_API_BASE_URL}/${anilistId}/${episode}`, {
      headers: {
        Accept: "application/json",
        // Cloudflare in front of the origin serves an interstitial to clients with no
        // recognisable UA. Node's fetch sends none, which is invisible locally (warm cache,
        // residential IP) but reliably breaks from a datacentre IP.
        "User-Agent": FLIX_USER_AGENT,
        Referer: FLIX_REFERER,
      },
      cache: "force-cache",
      next: { revalidate },
    });
  } catch {
    throw new StreamSourceError("The stream source could not be reached.");
  }

  if (!response.ok) throw new StreamSourceError(`The stream source replied ${response.status}.`);

  let json: FlixResponse;
  try {
    json = (await response.json()) as FlixResponse;
  } catch {
    throw new StreamSourceError("The stream source returned a malformed response.");
  }

  // servers.length is the only real check — an empty list means either a wrong id or a
  // genuinely unavailable episode, and the two responses are byte-identical.
  const servers = (json.servers ?? [])
    .filter((server) => server.dataLink && (server.dataType === "sub" || server.dataType === "dub"))
    .map(
      (server): StreamServer => ({
        id: server.$id,
        serverName: server.serverName,
        embedUrl: server.dataLink,
        audio: server.dataType === "dub" ? "dub" : "sub",
      }),
    );

  if (servers.length === 0) return null;

  return { episode, servers };
}

/** The site's own preference order: HD-2 first, then whatever came back first. */
export function pickDefaultServer(servers: StreamServer[], audio: "sub" | "dub"): StreamServer | undefined {
  const matching = servers.filter((server) => server.audio === audio);
  const pool = matching.length > 0 ? matching : servers;
  return pool.find((server) => server.serverName === "HD-2") ?? pool[0];
}
