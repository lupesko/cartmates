import { describe, expect, it } from "vitest";
import { addCommand } from "../fixtures/data";
import { freshList } from "../fixtures/worker";

describe("remove RPC", () => {
  it("removes exact duplicate by ID for another authorized actor", async () => {
    const stub = freshList();
    const first = await stub.mutate(addCommand("Eggs", "a", "Hagay"));
    const second = await stub.mutate(addCommand("Eggs", "b", "Dana"));
    const firstId = first.document.items[0]!.id;
    const result = await stub.mutate({ kind: "remove", operationId: crypto.randomUUID(), actorSub: "b", itemId: firstId });
    expect(result.document.items).toEqual([second.document.items[1]]);
  });
});
