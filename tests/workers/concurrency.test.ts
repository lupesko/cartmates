import { describe, expect, it } from "vitest";
import { addCommand } from "../fixtures/data";
import { freshList } from "../fixtures/worker";

describe("serialized collaboration", () => {
  it("loses no simultaneous additions across 100 trials", async () => {
    for (let trial = 0; trial < 100; trial += 1) {
      const stub = freshList();
      await Promise.all([stub.mutate(addCommand(`A-${trial}`, "a", "Hagay")), stub.mutate(addCommand(`B-${trial}`, "b", "Dana"))]);
      const list = await stub.getList();
      expect(list.items.map((entry) => entry.text).sort()).toEqual([`A-${trial}`, `B-${trial}`]);
      expect(list.revision).toBe(2);
    }
  }, 30_000);

  it("resolves Add/Clear races to a valid serialized order", async () => {
    for (let trial = 0; trial < 100; trial += 1) {
      const stub = freshList();
      await Promise.all([
        stub.mutate(addCommand(`Milk-${trial}`)),
        stub.mutate({ kind: "clear", operationId: crypto.randomUUID(), actorSub: "b" }),
      ]);
      const list = await stub.getList();
      expect([0, 1]).toContain(list.items.length);
      if (list.items.length === 1) expect(list.items[0]?.text).toBe(`Milk-${trial}`);
      expect(list.revision).toBe(2);
    }
  }, 30_000);
});
