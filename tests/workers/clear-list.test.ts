import { describe, expect, it } from "vitest";
import { addCommand } from "../fixtures/data";
import { freshList } from "../fixtures/worker";

describe("clear list RPC", () => {
  it("clears atomically, is safe empty, and delayed retry cannot remove a later add", async () => {
    const stub = freshList();
    await stub.mutate(addCommand());
    const clear = { kind: "clear" as const, operationId: crypto.randomUUID(), actorSub: "a" };
    expect((await stub.mutate(clear)).document.items).toEqual([]);
    await stub.mutate(addCommand("Later"));
    const replay = await stub.mutate(clear);
    expect(replay.alreadyProcessed).toBe(true);
    expect(replay.document.items.map((entry) => entry.text)).toEqual(["Later"]);
    expect((await stub.mutate({ kind: "clear", operationId: crypto.randomUUID(), actorSub: "a" })).outcome).toBe("applied");
    expect((await stub.mutate({ kind: "clear", operationId: crypto.randomUUID(), actorSub: "a" })).outcome).toBe("already_empty");
  });
});
