# Third-party upstreams block Vercel's datacentre IPs

`reanime.to` (flix streams) and `graphql.anilist.co` both sit behind Cloudflare, which
scores requests by source IP. Vercel serverless functions egress from datacentre ranges
that get challenged with a 403; the identical request from a developer's residential
connection succeeds. This produces the confusing "works locally, broken in production"
signature, and no amount of local testing reproduces it.

**Why:** two compounding causes, both invisible in dev —

1. Node's `fetch` sends **no** `User-Agent`. That alone is a bot signal to Cloudflare.
   `src/lib/anilist.ts` (`ANILIST_HEADERS`) and `src/lib/streams.ts` now always send one.
2. Once the block is at the IP layer, a UA is necessary but *not sufficient*. Only
   egressing from a different IP fixes it — hence `src/lib/egressProxy.ts`.

**How to apply:**

- `STREAM_PROXY_URL` (see `.env.example`) routes these calls through an HTTP proxy. It is
  **opt-in**: unset, `egressProxy.ts` is inert and fetches go direct, so local dev and e2e
  need no proxy account. Spread `...proxyDispatcher()` into any new fetch to these hosts.
- Read `process.env` **inside** the function, never at module scope — a module-scope read
  is inlined at build time and silently ignores the value set in the Vercel dashboard.
- Memoise the `ProxyAgent`; it owns a connection pool, so one per request leaks sockets.
- The flix origin replies `Cache-Control: no-store`, which makes Next refuse to populate
  the Data Cache — `next: { revalidate }` is a silent no-op there. Pair it with
  `cache: "force-cache"` to override the origin header.
- When diagnosing, check the Vercel function logs: a 403 means IP blocking, so the proxy
  is required. See also [[mal-api-direct-integration]] — this is outbound egress, and is
  *not* a licence to add a public inbound route handler.
