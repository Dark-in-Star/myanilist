import "server-only";
import { ProxyAgent, type Dispatcher } from "undici";

/**
 * Routes outbound stream-source requests through an HTTP proxy.
 *
 * Cloudflare fronts both `reanime.to` and `graphql.anilist.co` and scores requests by
 * source IP. Vercel's serverless functions egress from datacentre ranges that are
 * challenged outright — the same request that succeeds from a developer's residential
 * connection returns a 403 in production. A browser-like User-Agent is necessary but not
 * sufficient once the block is at the IP layer; the only fix is to egress elsewhere.
 *
 * Deliberately opt-in: with no PROXY_URL set this module is inert and fetches go direct,
 * so local development and e2e keep working with no proxy account.
 */

let cached: ProxyAgent | null | undefined;

/**
 * Built once and reused: a ProxyAgent owns a connection pool, and constructing one per
 * request leaks sockets and forfeits keep-alive to the proxy.
 */
function agent(): ProxyAgent | null {
  if (cached !== undefined) return cached;

  // Read at call time, not module scope: a module-scope read is inlined during the build,
  // which would bake in whatever the value was at build time and ignore the runtime
  // environment variable set in the Vercel dashboard.
  const proxyUrl = process.env.STREAM_PROXY_URL?.trim();

  if (!proxyUrl) {
    cached = null;
    return cached;
  }

  try {
    // Credentials, when present, are expected inline as http://user:pass@host:port.
    cached = new ProxyAgent({ uri: proxyUrl, requestTls: { timeout: 15_000 } });
  } catch {
    // A malformed PROXY_URL must degrade to a direct fetch rather than take down every
    // stream lookup with a construction error on the first request.
    console.error("STREAM_PROXY_URL is not a valid proxy URI — falling back to direct egress.");
    cached = null;
  }

  return cached;
}

export function isProxyConfigured(): boolean {
  return agent() !== null;
}

/**
 * Returns the `dispatcher` init field for a proxied fetch, or an empty object when no
 * proxy is configured. Spread into a fetch init so callers stay a single code path.
 *
 * `dispatcher` is a valid undici fetch option but absent from the DOM RequestInit types
 * Next compiles against, hence the cast.
 */
export function proxyDispatcher(): { dispatcher?: Dispatcher } {
  const proxy = agent();
  return proxy ? { dispatcher: proxy } : {};
}

/** Test seam: drops the memoised agent so a changed env var takes effect. */
export function resetProxyAgent(): void {
  cached = undefined;
}
