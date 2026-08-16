import "server-only";
import { randomBytes } from "node:crypto";

const MAL_AUTHORIZE_URL = "https://myanimelist.net/v1/oauth2/authorize";
const MAL_TOKEN_URL = "https://myanimelist.net/v1/oauth2/token";

function base64url(input: Buffer): string {
  return input.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function requireClientId(): string {
  const id = process.env.MAL_CLIENT_ID;
  if (!id) throw new Error("MAL_CLIENT_ID is not configured");
  return id;
}

export function createCodeVerifier(): string {
  return base64url(randomBytes(64));
}

export function createState(): string {
  return base64url(randomBytes(16));
}

export function buildAuthorizeUrl(state: string, verifier: string, redirectUri: string): string {
  const url = new URL(MAL_AUTHORIZE_URL);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", requireClientId());
  url.searchParams.set("state", state);
  url.searchParams.set("redirect_uri", redirectUri);
  // MAL only supports the "plain" code_challenge_method: challenge must equal verifier.
  url.searchParams.set("code_challenge", verifier);
  url.searchParams.set("code_challenge_method", "plain");
  return url.toString();
}

export interface MalTokenResponse {
  token_type: string;
  expires_in: number;
  access_token: string;
  refresh_token: string;
}

async function requestToken(form: Record<string, string>): Promise<MalTokenResponse> {
  const body = new URLSearchParams({ client_id: requireClientId(), ...form });

  const response = await fetch(MAL_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error(`MAL token request failed: ${response.status}`);
  }

  return (await response.json()) as MalTokenResponse;
}

export function exchangeCodeForToken(code: string, verifier: string, redirectUri: string) {
  return requestToken({
    grant_type: "authorization_code",
    code,
    code_verifier: verifier,
    redirect_uri: redirectUri,
  });
}

export function refreshAccessToken(refreshToken: string) {
  return requestToken({ grant_type: "refresh_token", refresh_token: refreshToken });
}
