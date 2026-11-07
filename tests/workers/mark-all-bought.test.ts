import { describe, expect, it } from "vitest";
import { addCommand } from "../fixtures/data";
import { freshList } from "../fixtures/worker";

describe("mark all bought RPC", () => {
  it("removes all active items with a distinct retry-safe operation and no history", async () => {
    const stub = freshList();
    await stub.mutate(addCommand("Milk"));
    await stub.mutate(addCommand("Eggs"));
    const command = { kind: "markAllBought" as const, operationId: crypto.randomUUID(), actorSub: "a" };
    const result = await stub.mutate(command);
    expect(result.document.items).toEqual([]);
    expect(result.document).not.toHaveProperty("history");
    expect((await stub.mutate(command)).alreadyProcessed).toBe(true);
  });
});
