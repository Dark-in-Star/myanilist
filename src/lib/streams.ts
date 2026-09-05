import "server-only";
import { getAniListId } from "./anilist";
import type { StreamServer, StreamSources } from "./types";

const FLIX_API_BASE_URL = process.env.FLIX_API_BASE_URL ?? "https://reanime.to/api/flix";

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
  if (!anilistId) return null;

  let response: Response;
  try {
    response = await fetch(`${FLIX_API_BASE_URL}/${anilistId}/${episode}`, {
      headers: { Accept: "application/json" },
      next: { revalidate },
    });
  } catch {
    return null;
  }

  if (!response.ok) return null;

  let json: FlixResponse;
  try {
    json = (await response.json()) as FlixResponse;
  } catch {
    return null;
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
