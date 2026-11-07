import { describe, expect, it } from "vitest";
import type { SessionClaims } from "../../shared/api-contracts";
import { clearSessionCookie, readSessionCookie, sessionCookie } from "../../functions/_lib/cookies";
import { requireMutationProtection } from "../../functions/_lib/csrf";
import { TEST_CSRF, TEST_KEY, TEST_ORIGIN } from "../fixtures/pages";

function claims(): SessionClaims {
  const now = Math.floor(Date.now() / 1000);
  return { v: 1, sub: "google-hagay", email: "hagay@example.com", name: "Hagay", csrf: TEST_CSRF, iat: now, exp: now + 86_400 };
}

describe("session and CSRF integration", () => {
  it("encrypts minimal claims in a hardened fixed-lifetime cookie", async () => {
    const cookie = await sessionCookie(claims(), TEST_KEY);
    expect(cookie).toMatch(/^__Host-cartmates_session=.+; Path=\/; Max-Age=86400; Secure; HttpOnly; SameSite=Strict$/u);
    const request = new Request(TEST_ORIGIN, { headers: { Cookie: cookie } });
    await expect(readSessionCookie(request, TEST_KEY)).resolves.toMatchObject({ sub: "google-hagay", name: "Hagay" });
    expect(cookie).not.toContain("hagay@example.com");
  });

  it("requires exact Origin and session CSRF on mutations", () => {
    const session = claims();
    expect(() => requireMutationProtection(new Request(TEST_ORIGIN, { method: "POST", headers: { Origin: TEST_ORIGIN, "X-CSRF-Token": TEST_CSRF } }), TEST_ORIGIN, session)).not.toThrow();
    expect(() => requireMutationProtection(new Request(TEST_ORIGIN, { method: "POST", headers: { Origin: "https://evil.test", "X-CSRF-Token": TEST_CSRF } }), TEST_ORIGIN, session)).toThrow();
  });

  it("clears the host-only local cookie", () => expect(clearSessionCookie()).toContain("Max-Age=0"));
});
