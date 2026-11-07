import { describe, expect, it } from "vitest";
import { onRequestGet as readList } from "../../functions/api/list/index";
import { onRequestPost as addItem } from "../../functions/api/items/index";
import { onRequestPost as clearList } from "../../functions/api/list/clear";
import { authenticatedHeaders, pagesContext, TEST_CSRF, TEST_ORIGIN } from "../fixtures/pages";

describe("cross-endpoint security boundaries", () => {
  it("rejects protected reads without authentication and discloses no list", async () => {
    const response = await readList(pagesContext<typeof readList>(new Request(`${TEST_ORIGIN}/api/list`)));
    expect(response.status).toBe(401);
    expect(await response.text()).not.toMatch(/items.*creatorName/iu);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("rejects wrong Origin, missing CSRF, and wrong content type", async () => {
    const wrongOrigin = await authenticatedHeaders({ Origin: "https://evil.test", "X-CSRF-Token": TEST_CSRF, "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() });
    expect((await addItem(pagesContext<typeof addItem>(new Request(`${TEST_ORIGIN}/api/items`, { method: "POST", headers: wrongOrigin, body: JSON.stringify({ text: "Milk" }) })))).status).toBe(403);
    const noCsrf = await authenticatedHeaders({ "Idempotency-Key": crypto.randomUUID() });
    expect((await clearList(pagesContext<typeof clearList>(new Request(`${TEST_ORIGIN}/api/list/clear`, { method: "POST", headers: noCsrf })))).status).toBe(403);
    const wrongType = await authenticatedHeaders({ "X-CSRF-Token": TEST_CSRF, "Idempotency-Key": crypto.randomUUID(), "Content-Type": "text/plain" });
    expect((await addItem(pagesContext<typeof addItem>(new Request(`${TEST_ORIGIN}/api/items`, { method: "POST", headers: wrongType, body: "Milk" })))).status).toBe(415);
  });
});
