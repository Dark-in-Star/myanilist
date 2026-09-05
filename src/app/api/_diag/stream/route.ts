import { NextResponse } from "next/server";

/**
 * TEMPORARY diagnostic. Reports what the deployed runtime actually sees when it calls the
 * stream upstreams, because the failure reproduces only from Vercel's egress IPs and not
 * from a developer machine. Remove once the stream lookup is confirmed working.
 */
export const dynamic = "force-dynamic";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

async function probe(label: string, url: string, init: RequestInit) {
  const started = Date.now();
  try {
    const res = await fetch(url, { ...init, cache: "no-store" });
    const body = await res.text();
    return {
      label,
      ok: res.ok,
      status: res.status,
      ms: Date.now() - started,
      server: res.headers.get("server"),
      cfRay: res.headers.get("cf-ray"),
      cfMitigated: res.headers.get("cf-mitigated"),
      bodyPreview: body.slice(0, 300),
    };
  } catch (error) {
    return { label, ok: false, error: String(error), ms: Date.now() - started };
  }
}

export async function GET() {
  const [ip, anilist, flix] = await Promise.all([
    probe("egress-ip", "https://api.ipify.org?format=json", {}),
    probe("anilist", "https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "MyAniList/1.0 (+https://myanilist.vercel.app)",
      },
      body: JSON.stringify({
        query: "query($m:Int){Media(idMal:$m,type:ANIME){id}}",
        variables: { m: 60636 },
      }),
    }),
    probe("flix", "https://reanime.to/api/flix/185874/1", {
      headers: { Accept: "application/json", "User-Agent": UA, Referer: "https://reanime.to/" },
    }),
  ]);

  return NextResponse.json({ ip, anilist, flix }, { headers: { "Cache-Control": "no-store" } });
}
