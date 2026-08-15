import type { BrowserContext, Page } from "@playwright/test";

const SESSION_COOKIE_NAME = "mal_session";

/**
 * Simulates a logged-in visitor by setting the session cookie directly, instead of
 * driving the real MAL OAuth redirect (which needs real user credentials and isn't
 * exercisable in automated e2e). The mock server (e2e/mock-server.mjs) accepts any
 * non-empty Bearer token, so the token value itself is arbitrary.
 */
export async function loginAs(pageOrContext: Page | BrowserContext, baseURL: string) {
  const context = "context" in pageOrContext ? pageOrContext.context() : pageOrContext;
  // Next.js URL-encodes cookie values it sets itself (and decodes them on read via
  // cookies().get().value), so a raw JSON value set directly here would come back
  // mangled. Encode it the same way to match what the real login flow produces.
  const value = encodeURIComponent(
    JSON.stringify({
      accessToken: "e2e-mock-access-token",
      refreshToken: "e2e-mock-refresh-token",
      expiresAt: Date.now() + 60 * 60 * 1000,
    }),
  );
  await context.addCookies([
    {
      name: SESSION_COOKIE_NAME,
      value,
      url: baseURL,
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
}
