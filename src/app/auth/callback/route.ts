import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { exchangeCodeForToken } from "@/lib/malAuth";
import { PKCE_COOKIE_NAME, SESSION_COOKIE_NAME, sessionCookieOptions } from "@/lib/session";

interface PendingAuth {
  verifier: string;
  state: string;
  returnTo?: string;
}

function parsePending(raw: string | undefined): PendingAuth | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<PendingAuth>;
    if (!parsed.verifier || !parsed.state) return null;
    return parsed as PendingAuth;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const store = await cookies();
  const pending = parsePending(store.get(PKCE_COOKIE_NAME)?.value);
  store.delete(PKCE_COOKIE_NAME);

  if (!code || !state || !pending || pending.state !== state) {
    return NextResponse.redirect(new URL("/?auth_error=1", request.url));
  }

  const redirectUri = new URL("/auth/callback", request.url).toString();

  try {
    const tokens = await exchangeCodeForToken(code, pending.verifier, redirectUri);
    store.set(
      SESSION_COOKIE_NAME,
      JSON.stringify({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: Date.now() + tokens.expires_in * 1000,
      }),
      sessionCookieOptions,
    );
  } catch {
    return NextResponse.redirect(new URL("/?auth_error=1", request.url));
  }

  return NextResponse.redirect(new URL(pending.returnTo || "/profile", request.url));
}
