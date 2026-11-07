import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { onRequestPost } from "../../functions/api/list/clear";
import { addCommand } from "../fixtures/data";
import { authenticatedHeaders, pagesContext, TEST_CSRF, TEST_ORIGIN } from "../fixtures/pages";

describe("POST /api/list/clear", () => {
  it("clears all items and safely resolves empty requests", async () => {
    await env.LIST.getByName("shared-list-v1").mutate(addCommand());
    for (const expected of ["applied", "already_empty"]) {
      const headers = await authenticatedHeaders({ "X-CSRF-Token": TEST_CSRF, "Idempotency-Key": crypto.randomUUID() });
      const response = await onRequestPost(pagesContext<typeof onRequestPost>(new Request(`${TEST_ORIGIN}/api/list/clear`, { method: "POST", headers })));
      await expect(response.json()).resolves.toMatchObject({ outcome: expected, list: { remainingCount: 0 } });
    }
  });
});
