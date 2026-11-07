import { evictDurableObject } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { addCommand } from "../fixtures/data";
import { freshList } from "../fixtures/worker";

describe("restart persistence", () => {
  it("preserves acknowledged IDs, text, attribution, revisions, and receipts for 20 cycles", async () => {
    const stub = freshList();
    const commands = [];
    for (let cycle = 0; cycle < 20; cycle += 1) {
      const command = addCommand(`Item-${cycle}`, `actor-${cycle}`, `Creator ${cycle}`);
      commands.push(command);
      await stub.mutate(command);
      await evictDurableObject(stub);
      const restored = await stub.getList();
      expect(restored.items[cycle]?.text).toBe(`Item-${cycle}`);
      expect(restored.items[cycle]?.creatorName).toBe(`Creator ${cycle}`);
      expect(restored.revision).toBe(cycle + 1);
    }
    const before = await stub.getList();
    expect((await stub.mutate(commands[0]!)).alreadyProcessed).toBe(true);
    expect((await stub.getList()).revision).toBe(before.revision);
  }, 30_000);
});
