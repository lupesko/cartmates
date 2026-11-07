import { sessionCookie } from "../../functions/_lib/cookies";
import type { SessionClaims } from "../../shared/api-contracts";
import { env } from "cloudflare:test";
import type { PagesEnv } from "../../functions/_lib/env";

export const TEST_ORIGIN = "https://cartmates.test";
export const TEST_KEY = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
export const TEST_CSRF = "0123456789abcdef0123456789abcdef";

export async function authenticatedHeaders(extra?: HeadersInit): Promise<Headers> {
  const now = Math.floor(Date.now() / 1000);
  const claims: SessionClaims = {
    v: 1,
    sub: "google-hagay",
    email: "hagay@example.com",
    name: "Hagay",
    csrf: TEST_CSRF,
    iat: now,
    exp: now + 86_400,
  };
  const cookie = await sessionCookie(claims, TEST_KEY);
  const headers = new Headers({ Cookie: cookie.split(";", 1)[0]!, Origin: TEST_ORIGIN, Accept: "application/json", ...Object.fromEntries(new Headers(extra)) });
  return headers;
}

export function pagesContext<F extends PagesFunction<PagesEnv>>(request: Request, params: Record<string, string | string[]> = {}): Parameters<F>[0] {
  return {
    request,
    env,
    params,
    data: {},
    functionPath: new URL(request.url).pathname,
    waitUntil: () => undefined,
    passThroughOnException: () => undefined,
    next: () => Promise.resolve(new Response(null, { status: 404 })),
  } as unknown as Parameters<F>[0];
}
