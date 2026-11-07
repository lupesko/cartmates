import { describe, expect, it } from "vitest";
import { addCommand } from "../fixtures/data";
import { freshList } from "../fixtures/worker";

describe("one configured group", () => {
  it("gives different authorized actors equal access to the same named list", async () => {
    const stub = freshList();
    await stub.mutate(addCommand("Milk", "a", "Hagay"));
    const added = await stub.mutate(addCommand("Eggs", "b", "Dana"));
    const milk = added.document.items[0]!;
    const removed = await stub.mutate({ kind: "remove", operationId: crypto.randomUUID(), actorSub: "b", itemId: milk.id });
    expect(removed.document.items.map((entry) => entry.creatorName)).toEqual(["Dana"]);
  });
});
