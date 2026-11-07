import { describe, expect, it } from "vitest";
import { addCommand } from "../fixtures/data";
import { freshList } from "../fixtures/worker";

describe("retry safety", () => {
  it("applies each destructive operation only once across 100 retries", async () => {
    for (let trial = 0; trial < 100; trial += 1) {
      const stub = freshList();
      await stub.mutate(addCommand(`Item-${trial}`));
      const clear = { kind: "clear" as const, operationId: crypto.randomUUID(), actorSub: "a" };
      await stub.mutate(clear);
      await stub.mutate(addCommand(`Later-${trial}`));
      const retry = await stub.mutate(clear);
      expect(retry.document.items.map((entry) => entry.text)).toEqual([`Later-${trial}`]);
      expect(retry.alreadyProcessed).toBe(true);
    }
  }, 30_000);
});
