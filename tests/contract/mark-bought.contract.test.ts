import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { onRequestPost } from "../../functions/api/items/[id]/bought";
import { addCommand } from "../fixtures/data";
import { authenticatedHeaders, pagesContext, TEST_CSRF, TEST_ORIGIN } from "../fixtures/pages";

describe("POST /api/items/{id}/bought", () => {
  it("removes the selected ID and returns authoritative state", async () => {
    const added = await env.LIST.getByName("shared-list-v1").mutate(addCommand());
    const id = added.document.items[0]!.id;
    const headers = await authenticatedHeaders({ "X-CSRF-Token": TEST_CSRF, "Idempotency-Key": crypto.randomUUID() });
    const request = new Request(`${TEST_ORIGIN}/api/items/${id}/bought`, { method: "POST", headers });
    const response = await onRequestPost(pagesContext<typeof onRequestPost>(request, { id }));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ outcome: "applied", list: { remainingCount: 0 } });
  });
});
