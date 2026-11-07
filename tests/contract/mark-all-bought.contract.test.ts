import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { onRequestPost } from "../../functions/api/list/mark-all-bought";
import { addCommand } from "../fixtures/data";
import { authenticatedHeaders, pagesContext, TEST_CSRF, TEST_ORIGIN } from "../fixtures/pages";

describe("POST /api/list/mark-all-bought", () => {
  it("returns an empty authoritative list without history", async () => {
    await env.LIST.getByName("shared-list-v1").mutate(addCommand());
    const headers = await authenticatedHeaders({ "X-CSRF-Token": TEST_CSRF, "Idempotency-Key": crypto.randomUUID() });
    const response = await onRequestPost(pagesContext<typeof onRequestPost>(new Request(`${TEST_ORIGIN}/api/list/mark-all-bought`, { method: "POST", headers })));
    const body = await response.json<Record<string, unknown>>();
    expect(body).toMatchObject({ outcome: "applied", list: { remainingCount: 0 } });
    expect(body).not.toHaveProperty("history");
  });
});
