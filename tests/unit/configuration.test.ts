import { describe, expect, it } from "vitest";
import { getConfig, type PagesEnv } from "../../functions/_lib/env";

function env(group?: string): PagesEnv {
  return {
    LIST: {} as PagesEnv["LIST"],
    APP_ORIGIN: "https://shopping.example.com",
    ...(group === undefined ? {} : { GROUP_DISPLAY_NAME: group }),
    GOOGLE_CLIENT_ID: "client",
    GOOGLE_CLIENT_SECRET: "secret",
    ALLOWED_EMAILS: "HAGAY@example.com, dana@example.com",
    SESSION_ENCRYPTION_KEY: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  };
}

describe("deployment configuration", () => {
  it("defaults and trims group names and normalizes allowlists", () => {
    expect(getConfig(env()).groupName).toBe("Our Groceries");
    const configured = getConfig(env("  Team Kitchen  "));
    expect(configured.groupName).toBe("Team Kitchen");
    expect(configured.allowedEmails.has("hagay@example.com")).toBe(true);
  });

  it("rejects origins with paths and empty allowlists", () => {
    expect(() => getConfig({ ...env(), APP_ORIGIN: "https://example.com/path" })).toThrow();
    expect(() => getConfig({ ...env(), ALLOWED_EMAILS: "" })).toThrow();
  });
});
