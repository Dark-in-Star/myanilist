import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { buildAuthorizeUrl, createCodeVerifier, createState } from "@/lib/malAuth";
import { PKCE_COOKIE_NAME, pkceCookieOptions } from "@/lib/session";

// Only accept a same-origin relative path (never an absolute/protocol-relative URL, which
// would turn this into an open redirect) and keep it out of the /auth/* flow itself.
function sanitizeReturnTo(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/auth")) return "/profile";
  return raw;
}

export async function GET(request: Request) {
  const verifier = createCodeVerifier();
  const state = createState();
  const redirectUri = new URL("/auth/callback", request.url).toString();
  const returnTo = sanitizeReturnTo(new URL(request.url).searchParams.get("returnTo"));

  const store = await cookies();
  store.set(PKCE_COOKIE_NAME, JSON.stringify({ verifier, state, returnTo }), pkceCookieOptions);

  return NextResponse.redirect(buildAuthorizeUrl(state, verifier, redirectUri));
}
