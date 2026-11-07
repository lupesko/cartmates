import { describe, expect, it } from "vitest";
import { addCommand } from "../fixtures/data";
import { freshList } from "../fixtures/worker";

describe("mark bought RPC", () => {
  it("removes one ID, returns already absent when stale, and stores no history", async () => {
    const stub = freshList();
    const added = await stub.mutate(addCommand("Eggs"));
    const id = added.document.items[0]!.id;
    const result = await stub.mutate({ kind: "markBought", operationId: crypto.randomUUID(), actorSub: "b", itemId: id });
    expect(result.document.items).toEqual([]);
    const stale = await stub.mutate({ kind: "markBought", operationId: crypto.randomUUID(), actorSub: "b", itemId: id });
    expect(stale.outcome).toBe("already_absent");
    expect(stale.document).not.toHaveProperty("history");
  });
});
