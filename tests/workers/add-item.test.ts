import { describe, expect, it } from "vitest";
import { addCommand } from "../fixtures/data";
import { freshList } from "../fixtures/worker";

describe("add item RPC", () => {
  it("allows duplicate text with unique backend IDs", async () => {
    const stub = freshList();
    await stub.mutate(addCommand(" Eggs "));
    const result = await stub.mutate(addCommand("Eggs"));
    expect(result.document.items.map((entry) => entry.text)).toEqual(["Eggs", "Eggs"]);
    expect(new Set(result.document.items.map((entry) => entry.id)).size).toBe(2);
  });

  it.each(["", "milk\ncheese", "a".repeat(201)])("rejects invalid text", async (text) => {
    expect(await freshList().mutateSafe(addCommand(text))).toMatchObject({ ok: false, error: { code: "validation_failed" } });
  });
});
