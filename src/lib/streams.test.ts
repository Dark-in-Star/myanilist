import { afterEach, describe, expect, it, vi } from "vitest";
import { getStreamSources, pickDefaultServer } from "./streams";
import type { StreamServer } from "./types";

function server(serverName: string, dataType: string, id = `${serverName}-${dataType}`) {
  return { $id: id, serverName, dataLink: `https://flixcloud.cc/e/${id}`, dataType };
}

/** First call is the AniList id lookup, second is the flix request. */
function mockChain(anilistId: number | null, flix: unknown, flixOk = true) {
  const fetchMock = vi.fn();
  fetchMock.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: { Media: anilistId === null ? null : { id: anilistId } } }),
  });
  fetchMock.mockResolvedValueOnce({ ok: flixOk, json: async () => flix });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getStreamSources", () => {
  it("queries flix with the AniList id, not the MAL id", async () => {
    const fetchMock = mockChain(154587, { success: true, servers: [server("HD-1", "sub")] });

    await getStreamSources(52991, 1);

    expect(fetchMock.mock.calls[1][0]).toBe("https://reanime.to/api/flix/154587/1");
  });

  it("maps servers to embed urls and audio tracks", async () => {
    mockChain(154587, {
      success: true,
      servers: [server("HD-1", "sub"), server("HD-2", "dub")],
    });

    const result = await getStreamSources(52991, 3);

    expect(result).toEqual({
      episode: 3,
      servers: [
        { id: "HD-1-sub", serverName: "HD-1", embedUrl: "https://flixcloud.cc/e/HD-1-sub", audio: "sub" },
        { id: "HD-2-dub", serverName: "HD-2", embedUrl: "https://flixcloud.cc/e/HD-2-dub", audio: "dub" },
      ],
    });
  });

  // A wrong id returns HTTP 200 with success:true and no servers, so servers.length is
  // the only signal that distinguishes a usable response.
  it("returns null when success is true but no servers came back", async () => {
    mockChain(154587, { success: true, servers: [] });
    expect(await getStreamSources(52991, 1)).toBeNull();
  });

  it("returns null without calling flix when AniList has no id", async () => {
    const fetchMock = mockChain(null, { success: true, servers: [server("HD-1", "sub")] });

    expect(await getStreamSources(999999, 1)).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("returns null when the flix request fails", async () => {
    mockChain(154587, {}, false);
    expect(await getStreamSources(52991, 1)).toBeNull();
  });

  it("drops servers with an unrecognised audio track", async () => {
    mockChain(154587, { success: true, servers: [server("HD-1", "raw"), server("HD-2", "sub")] });

    const result = await getStreamSources(52991, 1);

    expect(result?.servers).toHaveLength(1);
    expect(result?.servers[0].serverName).toBe("HD-2");
  });
});

describe("pickDefaultServer", () => {
  const servers: StreamServer[] = [
    { id: "a", serverName: "HD-1", embedUrl: "a", audio: "sub" },
    { id: "b", serverName: "HD-2", embedUrl: "b", audio: "sub" },
    { id: "c", serverName: "HD-1", embedUrl: "c", audio: "dub" },
  ];

  it("prefers HD-2 within the requested audio track", () => {
    expect(pickDefaultServer(servers, "sub")?.id).toBe("b");
  });

  it("falls back to the first server of the requested track when HD-2 is absent", () => {
    expect(pickDefaultServer(servers, "dub")?.id).toBe("c");
  });

  it("falls back to any server when the requested track is unavailable", () => {
    const subOnly = servers.filter((s) => s.audio === "sub");
    expect(pickDefaultServer(subOnly, "dub")?.id).toBe("b");
  });

  it("returns undefined for an empty list", () => {
    expect(pickDefaultServer([], "sub")).toBeUndefined();
  });
});
