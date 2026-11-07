import { describe, expect, it } from "vitest";
import { normalizeEmail, normalizeItemText, parseAllowlist, requireLocalReturnPath, requireUuid, validateGroupName } from "../../shared/validation";

describe("item validation", () => {
  it("trims and accepts one-line Unicode and exactly 200 code points", () => {
    expect(normalizeItemText("  חלב 🥛  ")).toBe("חלב 🥛");
    expect(normalizeItemText("a".repeat(200))).toHaveLength(200);
  });

  it.each(["", "   ", "milk\ncheese", "milk\rcheese", "a".repeat(201), "milk\u0000"])("rejects invalid item %j", (value) => {
    expect(() => normalizeItemText(value)).toThrow();
  });

  it("validates UUIDs, local paths, emails, allowlists, and group default", () => {
    const id = crypto.randomUUID();
    expect(requireUuid(id.toUpperCase())).toBe(id);
    expect(requireLocalReturnPath("/shopping?today=1")).toBe("/shopping?today=1");
    expect(() => requireLocalReturnPath("//evil.example")).toThrow();
    expect(normalizeEmail(" HAGAY@Example.COM ")).toBe("hagay@example.com");
    expect(parseAllowlist("hagay@example.com, dana@example.com").size).toBe(2);
    expect(validateGroupName(undefined)).toBe("Our Groceries");
  });
});
