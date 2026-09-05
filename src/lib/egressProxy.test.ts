import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { isProxyConfigured, proxyDispatcher, resetProxyAgent } from "./egressProxy";

const ORIGINAL = process.env.STREAM_PROXY_URL;

beforeEach(() => {
  resetProxyAgent();
});

afterEach(() => {
  if (ORIGINAL === undefined) delete process.env.STREAM_PROXY_URL;
  else process.env.STREAM_PROXY_URL = ORIGINAL;
  resetProxyAgent();
});

describe("egressProxy", () => {
  it("is inert when no proxy is configured", () => {
    delete process.env.STREAM_PROXY_URL;
    resetProxyAgent();

    expect(isProxyConfigured()).toBe(false);
    // An empty object spreads into a fetch init without changing it, so an unconfigured
    // deployment keeps fetching directly.
    expect(proxyDispatcher()).toEqual({});
  });

  it("treats a blank value as unconfigured", () => {
    process.env.STREAM_PROXY_URL = "   ";
    resetProxyAgent();

    expect(isProxyConfigured()).toBe(false);
  });

  it("supplies a dispatcher when a proxy is configured", () => {
    process.env.STREAM_PROXY_URL = "http://user:pass@proxy.example.com:8080";
    resetProxyAgent();

    expect(isProxyConfigured()).toBe(true);
    expect(proxyDispatcher().dispatcher).toBeDefined();
  });

  it("reuses one agent instead of building a pool per request", () => {
    process.env.STREAM_PROXY_URL = "http://proxy.example.com:8080";
    resetProxyAgent();

    expect(proxyDispatcher().dispatcher).toBe(proxyDispatcher().dispatcher);
  });

  // A bad value must not take down every stream lookup with a constructor throw.
  it("falls back to direct egress on a malformed proxy url", () => {
    process.env.STREAM_PROXY_URL = "not a url";
    resetProxyAgent();

    expect(isProxyConfigured()).toBe(false);
    expect(proxyDispatcher()).toEqual({});
  });

  // The value is set in the Vercel dashboard, so a build-time read would bake in the
  // wrong value and silently ignore the runtime configuration.
  it("reads the env var at call time, not at module load", () => {
    delete process.env.STREAM_PROXY_URL;
    resetProxyAgent();
    expect(isProxyConfigured()).toBe(false);

    process.env.STREAM_PROXY_URL = "http://proxy.example.com:8080";
    resetProxyAgent();
    expect(isProxyConfigured()).toBe(true);
  });
});
