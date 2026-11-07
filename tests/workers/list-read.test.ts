import { evictDurableObject } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { addCommand } from "../fixtures/data";
import { freshList } from "../fixtures/worker";

describe("durable list reads", () => {
  it("starts empty and survives object eviction", async () => {
    const stub = freshList();
    expect(await stub.getList()).toEqual({ schemaVersion: 1, revision: 0, items: [] });
    await stub.mutate(addCommand());
    await evictDurableObject(stub);
    const restored = await stub.getList();
    expect(restored.revision).toBe(1);
    expect(restored.items[0]?.creatorName).toBe("Hagay");
  });
});
