import { describe, expect, it } from "vitest";
import { onRequestPost } from "../../functions/api/items/index";
import { authenticatedHeaders, pagesContext, TEST_CSRF, TEST_ORIGIN } from "../fixtures/pages";

async function add(body: unknown, extra?: HeadersInit) {
  const headers = await authenticatedHeaders({ "Content-Type": "application/json", "X-CSRF-Token": TEST_CSRF, "Idempotency-Key": crypto.randomUUID(), ...Object.fromEntries(new Headers(extra)) });
  const request = new Request(`${TEST_ORIGIN}/api/items`, { method: "POST", headers, body: JSON.stringify(body) });
  return onRequestPost(pagesContext<typeof onRequestPost>(request));
}

describe("POST /api/items", () => {
  it("accepts only text and derives creator server-side", async () => {
    const response = await add({ text: "  Milk  " });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ outcome: "applied", list: { remainingCount: 1, items: [{ text: "Milk", creatorName: "Hagay" }] } });
  });

  it.each([{ text: "" }, { text: "a".repeat(201) }, { text: "milk\neggs" }, { text: "Milk", creatorName: "Mallory" }])("rejects invalid or forged body %#", async (body) => {
    expect((await add(body)).status).toBe(400);
  });

  it("requires current auth, JSON, CSRF, and idempotency", async () => {
    const headers = await authenticatedHeaders();
    expect((await onRequestPost(pagesContext<typeof onRequestPost>(new Request(`${TEST_ORIGIN}/api/items`, { method: "POST", headers })))).status).toBe(403);
  });
});
