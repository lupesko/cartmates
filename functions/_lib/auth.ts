import { base64url, createRemoteJWKSet, jwtVerify } from "jose";
import { AppError, type OAuthTransaction, type SessionClaims } from "../../shared/api-contracts";
import { normalizeEmail, requireDisplayName } from "../../shared/validation";
import { readSessionCookie } from "./cookies";
import { getConfig, type AppConfig, type PagesEnv } from "./env";

const GOOGLE_JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

export function randomToken(bytes = 32): string {
  const value = new Uint8Array(bytes);
  crypto.getRandomValues(value);
  return base64url.encode(value);
}

export async function pkceChallenge(verifier: string): Promise<string> {
  return base64url.encode(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier))));
}

export function createOAuthTransaction(returnPath: string): OAuthTransaction {
  const now = Math.floor(Date.now() / 1000);
  return { state: randomToken(), nonce: randomToken(), codeVerifier: randomToken(48), returnPath, iat: now, exp: now + 600 };
}

export async function exchangeGoogleCode(code: string, transaction: OAuthTransaction, config: AppConfig): Promise<SessionClaims> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams({
      code,
      client_id: config.googleClientId,
      client_secret: config.googleClientSecret,
      redirect_uri: `${config.appOrigin}/api/auth/callback`,
      grant_type: "authorization_code",
      code_verifier: transaction.codeVerifier,
    }),
  });
  if (!response.ok) throw new AppError("access_denied", 403, "Google sign-in could not be completed");
  const tokens: unknown = await response.json();
  if (typeof tokens !== "object" || tokens === null || !("id_token" in tokens) || typeof tokens.id_token !== "string") {
    throw new AppError("access_denied", 403, "Google sign-in could not be completed");
  }
  const verified = await jwtVerify(tokens.id_token, GOOGLE_JWKS, {
    audience: config.googleClientId,
    issuer: ["https://accounts.google.com", "accounts.google.com"],
  });
  const claims = verified.payload;
  const now = Math.floor(Date.now() / 1000);
  if (claims.nonce !== transaction.nonce || (claims.azp !== undefined && claims.azp !== config.googleClientId) ||
      claims.email_verified !== true || typeof claims.sub !== "string" || claims.sub.length === 0 ||
      typeof claims.iat !== "number" || claims.iat > now + 60 || claims.iat < transaction.iat - 60) {
    throw new AppError("access_denied", 403, "Google identity could not be verified");
  }
  const email = normalizeEmail(claims.email);
  if (!config.allowedEmails.has(email)) throw new AppError("access_denied", 403, "This Google account is not approved for this CartMates instance");
  return { v: 1, sub: claims.sub, email, name: requireDisplayName(claims.name), csrf: randomToken(), iat: now, exp: now + 86_400 };
}

export async function requireSession(request: Request, env: PagesEnv): Promise<{ claims: SessionClaims; config: AppConfig }> {
  const config = getConfig(env);
  const claims = await readSessionCookie(request, config.sessionEncryptionKey);
  if (!config.allowedEmails.has(claims.email)) throw new AppError("access_denied", 403, "This Google account is not approved for this CartMates instance");
  return { claims, config };
}
