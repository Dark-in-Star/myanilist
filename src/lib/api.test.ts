import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, getAnimeRanking, getAnime, searchAnime } from "./api";

const originalFetch = global.fetch;

function mockFetchOnce(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  const { ok = true, status = 200 } = init;
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(body),
  });
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

beforeEach(() => {
  process.env.MAL_API_BASE_URL = "http://localhost:3000";
});

afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe("searchAnime", () => {
  it("builds a request with the search query and limit", async () => {
    const fetchMock = mockFetchOnce({ data: [] });

    await searchAnime("naruto", 10);

    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toContain("/anime?");
    expect(url).toContain("q=naruto");
    expect(url).toContain("limit=10");
  });
});

describe("getAnimeRanking", () => {
  it("requests the given ranking type", async () => {
    const fetchMock = mockFetchOnce({ data: [] });

    await getAnimeRanking("airing", 5);

    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toContain("ranking_type=airing");
    expect(url).toContain("limit=5");
  });
});

describe("getAnime", () => {
  it("returns the parsed anime on success", async () => {
    mockFetchOnce({ id: 1, title: "Frieren" });

    const result = await getAnime(1);

    expect(result).toEqual({ id: 1, title: "Frieren" });
  });

  it("throws an ApiError with status 404 for a missing anime", async () => {
    mockFetchOnce({ error: "not_found" }, { ok: false, status: 404 });

    await expect(getAnime(999)).rejects.toMatchObject({ status: 404 });
    await expect(getAnime(999)).rejects.toBeInstanceOf(ApiError);
  });

  it("throws a 503 ApiError when the server is unreachable", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("network down")) as unknown as typeof fetch;

    await expect(getAnime(1)).rejects.toMatchObject({ status: 503 });
  });
});
