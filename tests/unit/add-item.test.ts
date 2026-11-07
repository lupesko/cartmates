import { describe, expect, it } from "vitest";
import { EMPTY_LIST } from "../../shared/list-document";
import { applyCommand, commandFingerprint } from "../../shared/list-state";
import { addCommand } from "../fixtures/data";

describe("add transition", () => {
  it("appends duplicates with unique IDs and immutable creator snapshots", () => {
    const first = applyCommand(EMPTY_LIST, addCommand(" Eggs ", "a", "Hagay"));
    const document = { ...EMPTY_LIST, revision: 1, items: first.items };
    const second = applyCommand(document, addCommand("Eggs", "b", "Dana"));
    expect(second.items.map((entry) => entry.text)).toEqual(["Eggs", "Eggs"]);
    expect(new Set(second.items.map((entry) => entry.id)).size).toBe(2);
    expect(second.items.map((entry) => entry.creatorName)).toEqual(["Hagay", "Dana"]);
    expect(second.items[0]).not.toHaveProperty("createdAt");
  });

  it("uses a content-free fixed-length receipt fingerprint", async () => {
    const fingerprint = await commandFingerprint(addCommand("Private grocery text"));
    expect(fingerprint).toMatch(/^[0-9a-f]{64}$/u);
    expect(fingerprint).not.toContain("Private grocery text");
  });
});
