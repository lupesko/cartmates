import { base64url, CompactEncrypt, compactDecrypt } from "jose";
import { AppError, type OAuthTransaction, type SessionClaims } from "../../shared/api-contracts";
import { validateSessionClaims } from "../../shared/validation";

export const SESSION_COOKIE = "__Host-cartmates_session";
export const OAUTH_COOKIE = "__Host-cartmates_oauth";

function encryptionKey(encoded: string): Uint8Array {
  let key: Uint8Array;
  try { key = base64url.decode(encoded); } catch { throw new AppError("internal_error", 500, "Session encryption is not configured"); }
  if (key.byteLength !== 32) throw new AppError("internal_error", 500, "Session encryption is not configured");
  return key;
}

function cookieValue(request: Request, name: string): string | undefined {
  const cookie = request.headers.get("Cookie");
  if (cookie === null) return undefined;
  for (const part of cookie.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return value.join("=");
  }
  return undefined;
}

async function seal(payload: object, key: string, type: string): Promise<string> {
  return new CompactEncrypt(new TextEncoder().encode(JSON.stringify(payload)))
    .setProtectedHeader({ alg: "dir", enc: "A256GCM", typ: type })
    .encrypt(encryptionKey(key));
}

async function open(token: string, key: string, type: string): Promise<unknown> {
  try {
    const result = await compactDecrypt(token, encryptionKey(key));
    if (result.protectedHeader.typ !== type || result.protectedHeader.alg !== "dir" || result.protectedHeader.enc !== "A256GCM") throw new Error("header");
    return JSON.parse(new TextDecoder().decode(result.plaintext));
  } catch {
    throw new AppError("unauthenticated", 401, "Your session has expired. Please sign in again.");
  }
}

export async function sessionCookie(claims: SessionClaims, key: string): Promise<string> {
  const value = await seal(claims, key, "cartmates-session+jwe");
  return `${SESSION_COOKIE}=${value}; Path=/; Max-Age=86400; Secure; HttpOnly; SameSite=Strict`;
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=Strict`;
}

export async function readSessionCookie(request: Request, key: string): Promise<SessionClaims> {
  const value = cookieValue(request, SESSION_COOKIE);
  if (value === undefined) throw new AppError("unauthenticated", 401, "Please sign in to continue.");
  return validateSessionClaims(await open(value, key, "cartmates-session+jwe"));
}

export async function oauthCookie(transaction: OAuthTransaction, key: string): Promise<string> {
  const value = await seal(transaction, key, "cartmates-oauth+jwe");
  return `${OAUTH_COOKIE}=${value}; Path=/; Max-Age=600; Secure; HttpOnly; SameSite=Lax`;
}

export function clearOAuthCookie(): string {
  return `${OAUTH_COOKIE}=; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=Lax`;
}

export async function readOAuthCookie(request: Request, key: string): Promise<OAuthTransaction> {
  const value = cookieValue(request, OAUTH_COOKIE);
  if (value === undefined) throw new AppError("invalid_request", 400, "Sign-in request has expired");
  const payload = await open(value, key, "cartmates-oauth+jwe");
  if (typeof payload !== "object" || payload === null) throw new AppError("invalid_request", 400, "Sign-in request is invalid");
  const transaction = payload as Partial<OAuthTransaction>;
  const now = Math.floor(Date.now() / 1000);
  if (typeof transaction.state !== "string" || typeof transaction.nonce !== "string" || typeof transaction.codeVerifier !== "string" ||
      typeof transaction.returnPath !== "string" || typeof transaction.iat !== "number" || typeof transaction.exp !== "number" ||
      transaction.exp <= now || transaction.exp - transaction.iat > 600) {
    throw new AppError("invalid_request", 400, "Sign-in request has expired");
  }
  return transaction as OAuthTransaction;
}
