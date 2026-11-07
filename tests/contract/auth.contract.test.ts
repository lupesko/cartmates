import { describe, expect, it } from "vitest";
import { onRequestGet as login } from "../../functions/api/auth/login";
import { onRequestGet as session } from "../../functions/api/session";
import { onRequestPost as logout } from "../../functions/api/auth/logout";
import { authenticatedHeaders, pagesContext, TEST_ORIGIN } from "../fixtures/pages";

describe("authentication API contract", () => {
  it("starts Google Authorization Code + PKCE with a hardened transaction cookie", async () => {
    const response = await login(pagesContext<typeof login>(new Request(`${TEST_ORIGIN}/api/auth/login`)));
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toContain("accounts.google.com/o/oauth2/v2/auth");
    expect(response.headers.get("Location")).toContain("code_challenge_method=S256");
    expect(response.headers.get("Set-Cookie")).toMatch(/__Host-cartmates_oauth=.*Secure; HttpOnly; SameSite=Lax/u);
  });

  it("rejects session reads without a cookie and returns authorized presentation safely", async () => {
    const denied = await session(pagesContext<typeof session>(new Request(`${TEST_ORIGIN}/api/session`)));
    expect(denied.status).toBe(401);
    const allowed = await session(pagesContext<typeof session>(new Request(`${TEST_ORIGIN}/api/session`, { headers: await authenticatedHeaders() })));
    expect(allowed.status).toBe(200);
    await expect(allowed.json()).resolves.toMatchObject({ user: { displayName: "Hagay" }, groupName: "Our Groceries" });
  });

  it("requires CSRF to sign out and clears only the local session", async () => {
    const response = await logout(pagesContext<typeof logout>(new Request(`${TEST_ORIGIN}/api/auth/logout`, { method: "POST", headers: await authenticatedHeaders() })));
    expect(response.status).toBe(403);
  });
});
