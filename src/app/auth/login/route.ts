import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { buildAuthorizeUrl, createCodeVerifier, createState } from "@/lib/malAuth";
import { PKCE_COOKIE_NAME, pkceCookieOptions } from "@/lib/session";

export async function GET(request: Request) {
  const verifier = createCodeVerifier();
  const state = createState();
  const redirectUri = new URL("/auth/callback", request.url).toString();

  const store = await cookies();
  store.set(PKCE_COOKIE_NAME, JSON.stringify({ verifier, state }), pkceCookieOptions);

  return NextResponse.redirect(buildAuthorizeUrl(state, verifier, redirectUri));
}
