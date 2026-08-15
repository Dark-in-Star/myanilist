import { createServer } from "node:http";
import { URL } from "node:url";

// A tiny in-memory stand-in for myanilist-server, used only by the e2e suite.
// It never talks to the real MyAnimeList API, so e2e runs can freely exercise
// list-mutation flows without touching anyone's real account.

const PORT = Number(process.env.MOCK_SERVER_PORT ?? 3900);

function animeNode(id, title, overrides = {}) {
  return {
    id,
    title,
    main_picture: { medium: `https://cdn.myanimelist.net/images/anime/mock/${id}.jpg`, large: `https://cdn.myanimelist.net/images/anime/mock/${id}l.jpg` },
    mean: 7.5,
    media_type: "tv",
    status: "finished_airing",
    num_episodes: 24,
    genres: [{ id: 1, name: "Action" }],
    synopsis: `Synopsis for ${title}.`,
    source: "manga",
    average_episode_duration: 1440,
    rating: "pg_13",
    studios: [{ id: 1, name: "Mock Studio" }],
    start_date: "2020-01-01",
    end_date: "2020-06-01",
    num_list_users: 10000,
    num_scoring_users: 5000,
    ...overrides,
  };
}

function mangaNode(id, title, overrides = {}) {
  return {
    id,
    title,
    main_picture: { medium: `https://cdn.myanimelist.net/images/manga/mock/${id}.jpg`, large: `https://cdn.myanimelist.net/images/manga/mock/${id}l.jpg` },
    mean: 7.8,
    media_type: "manga",
    status: "finished",
    num_volumes: 10,
    num_chapters: 80,
    genres: [{ id: 2, name: "Drama" }],
    synopsis: `Synopsis for ${title}.`,
    num_list_users: 8000,
    num_scoring_users: 4000,
    ...overrides,
  };
}

const ANIME = Array.from({ length: 30 }, (_, i) => animeNode(1000 + i, `Mock Anime ${i + 1}`));
const MANGA = Array.from({ length: 30 }, (_, i) => mangaNode(2000 + i, `Mock Manga ${i + 1}`));

const animeListStatus = new Map([
  [1000, { status: "watching", score: 7, num_episodes_watched: 5, is_rewatching: false, updated_at: "2024-01-01T00:00:00Z" }],
  [1001, { status: "completed", score: 9, num_episodes_watched: 24, is_rewatching: false, updated_at: "2024-01-01T00:00:00Z" }],
  [1002, { status: "on_hold", score: 0, num_episodes_watched: 3, is_rewatching: false, updated_at: "2024-01-01T00:00:00Z" }],
  [1003, { status: "dropped", score: 4, num_episodes_watched: 2, is_rewatching: false, updated_at: "2024-01-01T00:00:00Z" }],
  [1004, { status: "plan_to_watch", score: 0, num_episodes_watched: 0, is_rewatching: false, updated_at: "2024-01-01T00:00:00Z" }],
]);

const mangaListStatus = new Map([
  [2000, { status: "reading", score: 8, num_chapters_read: 40, num_volumes_read: 4, is_rereading: false, updated_at: "2024-01-01T00:00:00Z" }],
  [2001, { status: "completed", score: 9, num_chapters_read: 80, num_volumes_read: 10, is_rereading: false, updated_at: "2024-01-01T00:00:00Z" }],
  [2002, { status: "plan_to_read", score: 0, num_chapters_read: 0, num_volumes_read: 0, is_rereading: false, updated_at: "2024-01-01T00:00:00Z" }],
]);

function json(res, status, body) {
  const payload = body === undefined ? "" : JSON.stringify(body);
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(payload);
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

function paginate(list, searchParams) {
  const offset = Number(searchParams.get("offset") ?? 0);
  const limit = Number(searchParams.get("limit") ?? 24);
  const page = list.slice(offset, offset + limit);
  const hasMore = offset + limit < list.length;
  return { page, offset, hasMore };
}

// Mirrors myanilist-server: authenticated endpoints require the caller's own
// Bearer token instead of a server-wide one. Any non-empty token is accepted here
// (this is a mock), so tests only need to set a plausible-looking session cookie.
function bearerToken(req) {
  const header = req.headers["authorization"];
  if (!header) return undefined;
  const [scheme, token] = header.split(" ");
  return scheme === "Bearer" && token ? token : undefined;
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);
  const parts = url.pathname.split("/").filter(Boolean);
  if (process.env.MOCK_SERVER_DEBUG) {
    console.log(`[mock] ${req.method} ${url.pathname} auth=${req.headers["authorization"] ?? "(none)"}`);
  }

  if (req.method === "GET" && url.pathname === "/health") {
    return json(res, 200, { status: "ok", hasAccessToken: true });
  }

  if (req.method === "GET" && url.pathname === "/anime") {
    const q = (url.searchParams.get("q") ?? "").toLowerCase();
    const matches = ANIME.filter((a) => a.title.toLowerCase().includes(q));
    const { page, hasMore } = paginate(matches, url.searchParams);
    return json(res, 200, { data: page.map((node) => ({ node })), paging: hasMore ? { next: "has-more" } : {} });
  }

  if (req.method === "GET" && parts[0] === "anime" && parts[1] === "season" && parts.length === 4) {
    const year = Number(parts[2]);
    // No anime aired before MAL's earliest real records — mirrors real API behavior for
    // out-of-range seasons so the empty-state UI has something real to exercise.
    const source = year < 1950 ? [] : ANIME;
    const { page, hasMore } = paginate(source, url.searchParams);
    return json(res, 200, { data: page.map((node) => ({ node })), paging: hasMore ? { next: "has-more" } : {} });
  }

  if (req.method === "GET" && parts[0] === "anime" && parts[1] === "ranking") {
    const { page, offset, hasMore } = paginate(ANIME, url.searchParams);
    return json(res, 200, {
      data: page.map((node, i) => ({ node, ranking: { rank: offset + i + 1 } })),
      paging: hasMore ? { next: "has-more" } : {},
    });
  }

  if (req.method === "GET" && parts[0] === "anime" && parts.length === 2 && parts[2] !== "my_list_status") {
    const id = Number(parts[1]);
    const node = ANIME.find((a) => a.id === id);
    if (!node) return json(res, 404, { error: "not_found" });
    const status = bearerToken(req) ? animeListStatus.get(id) : undefined;
    return json(res, 200, status ? { ...node, my_list_status: status } : node);
  }

  if (req.method === "PUT" && parts[0] === "anime" && parts[2] === "my_list_status") {
    if (!bearerToken(req)) return json(res, 401, { error: "unauthorized" });
    const id = Number(parts[1]);
    const body = new URLSearchParams(await readBody(req));
    const current = animeListStatus.get(id) ?? { status: undefined, score: 0, num_episodes_watched: 0, is_rewatching: false };
    const updated = {
      ...current,
      ...(body.has("status") ? { status: body.get("status") } : {}),
      ...(body.has("score") ? { score: Number(body.get("score")) } : {}),
      ...(body.has("num_watched_episodes") ? { num_episodes_watched: Number(body.get("num_watched_episodes")) } : {}),
      updated_at: new Date().toISOString(),
    };
    animeListStatus.set(id, updated);
    return json(res, 200, updated);
  }

  if (req.method === "DELETE" && parts[0] === "anime" && parts[2] === "my_list_status") {
    if (!bearerToken(req)) return json(res, 401, { error: "unauthorized" });
    const id = Number(parts[1]);
    animeListStatus.delete(id);
    return json(res, 204);
  }

  if (req.method === "GET" && url.pathname === "/manga") {
    const q = (url.searchParams.get("q") ?? "").toLowerCase();
    const matches = MANGA.filter((m) => m.title.toLowerCase().includes(q));
    const { page, hasMore } = paginate(matches, url.searchParams);
    return json(res, 200, { data: page.map((node) => ({ node })), paging: hasMore ? { next: "has-more" } : {} });
  }

  if (req.method === "GET" && parts[0] === "manga" && parts[1] === "ranking") {
    const { page, offset, hasMore } = paginate(MANGA, url.searchParams);
    return json(res, 200, {
      data: page.map((node, i) => ({ node, ranking: { rank: offset + i + 1 } })),
      paging: hasMore ? { next: "has-more" } : {},
    });
  }

  if (req.method === "GET" && parts[0] === "manga" && parts.length === 2 && parts[2] !== "my_list_status") {
    const id = Number(parts[1]);
    const node = MANGA.find((m) => m.id === id);
    if (!node) return json(res, 404, { error: "not_found" });
    const status = bearerToken(req) ? mangaListStatus.get(id) : undefined;
    return json(res, 200, status ? { ...node, my_list_status: status } : node);
  }

  if (req.method === "PUT" && parts[0] === "manga" && parts[2] === "my_list_status") {
    if (!bearerToken(req)) return json(res, 401, { error: "unauthorized" });
    const id = Number(parts[1]);
    const body = new URLSearchParams(await readBody(req));
    const current = mangaListStatus.get(id) ?? { status: undefined, score: 0, num_chapters_read: 0, num_volumes_read: 0, is_rereading: false };
    const updated = {
      ...current,
      ...(body.has("status") ? { status: body.get("status") } : {}),
      ...(body.has("score") ? { score: Number(body.get("score")) } : {}),
      ...(body.has("num_chapters_read") ? { num_chapters_read: Number(body.get("num_chapters_read")) } : {}),
      ...(body.has("num_volumes_read") ? { num_volumes_read: Number(body.get("num_volumes_read")) } : {}),
      updated_at: new Date().toISOString(),
    };
    mangaListStatus.set(id, updated);
    return json(res, 200, updated);
  }

  if (req.method === "DELETE" && parts[0] === "manga" && parts[2] === "my_list_status") {
    if (!bearerToken(req)) return json(res, 401, { error: "unauthorized" });
    const id = Number(parts[1]);
    mangaListStatus.delete(id);
    return json(res, 204);
  }

  if (req.method === "GET" && url.pathname === "/users/@me/animelist") {
    if (!bearerToken(req)) return json(res, 401, { error: "unauthorized" });
    const data = ANIME.filter((a) => animeListStatus.has(a.id)).map((node) => ({
      node,
      list_status: animeListStatus.get(node.id),
    }));
    return json(res, 200, { data, paging: {} });
  }

  if (req.method === "GET" && url.pathname === "/users/@me/mangalist") {
    if (!bearerToken(req)) return json(res, 401, { error: "unauthorized" });
    const data = MANGA.filter((m) => mangaListStatus.has(m.id)).map((node) => ({
      node,
      list_status: mangaListStatus.get(node.id),
    }));
    return json(res, 200, { data, paging: {} });
  }

  if (req.method === "GET" && url.pathname === "/users/@me") {
    if (!bearerToken(req)) return json(res, 401, { error: "unauthorized" });
    return json(res, 200, {
      id: 1,
      name: "Mock User",
      picture: "https://cdn.myanimelist.net/images/mock/avatar.jpg",
      location: "Testland",
      joined_at: "2020-01-01T00:00:00Z",
      anime_statistics: {
        num_items_watching: 1,
        num_items_completed: 1,
        num_items_on_hold: 1,
        num_items_dropped: 1,
        num_items_plan_to_watch: 1,
        num_items: 5,
        num_days_watched: 12.5,
        num_days_watching: 3,
        num_days_completed: 8,
        num_days_on_hold: 1,
        num_days_dropped: 0.5,
        num_days: 12.5,
        num_episodes: 200,
        num_times_rewatched: 0,
        mean_score: 7.6,
      },
    });
  }

  json(res, 404, { error: "not_found" });
});

server.listen(PORT, () => {
  console.log(`mock myanilist-server listening on http://localhost:${PORT}`);
});
