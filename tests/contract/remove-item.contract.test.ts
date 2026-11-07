import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { onRequestDelete } from "../../functions/api/items/[id]/index";
import { addCommand } from "../fixtures/data";
import { authenticatedHeaders, pagesContext, TEST_CSRF, TEST_ORIGIN } from "../fixtures/pages";

describe("DELETE /api/items/{id}", () => {
  it("removes exact ID and returns a safe stale result", async () => {
    const added = await env.LIST.getByName("shared-list-v1").mutate(addCommand());
    const id = added.document.items[0]!.id;
    for (const expected of ["applied", "already_absent"]) {
      const headers = await authenticatedHeaders({ "X-CSRF-Token": TEST_CSRF, "Idempotency-Key": crypto.randomUUID() });
      const request = new Request(`${TEST_ORIGIN}/api/items/${id}`, { method: "DELETE", headers });
      const response = await onRequestDelete(pagesContext<typeof onRequestDelete>(request, { id }));
      await expect(response.json()).resolves.toMatchObject({ outcome: expected, list: { remainingCount: 0 } });
    }
  });
});
