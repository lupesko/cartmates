import { describe, expect, it } from "vitest";
import { onRequestGet } from "../../functions/api/list/index";
import { authenticatedHeaders, pagesContext, TEST_ORIGIN } from "../fixtures/pages";

describe("GET /api/list", () => {
  it("returns the protected authoritative empty list, count, ETag, and no-store", async () => {
    const response = await onRequestGet(pagesContext<typeof onRequestGet>(new Request(`${TEST_ORIGIN}/api/list`, { headers: await authenticatedHeaders() })));
    expect(response.status).toBe(200);
    expect(response.headers.get("ETag")).toBe('"0"');
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({ revision: 0, items: [], remainingCount: 0, groupName: "Our Groceries" });
  });

  it("returns 304 for a matching revision and 401 without auth", async () => {
    const headers = await authenticatedHeaders({ "If-None-Match": '"0"' });
    expect((await onRequestGet(pagesContext<typeof onRequestGet>(new Request(`${TEST_ORIGIN}/api/list`, { headers })))).status).toBe(304);
    expect((await onRequestGet(pagesContext<typeof onRequestGet>(new Request(`${TEST_ORIGIN}/api/list`)))).status).toBe(401);
  });
});
