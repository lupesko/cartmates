import { describe, expect, it } from "vitest";
import { applyCommand } from "../../shared/list-state";
import { item } from "../fixtures/data";

describe("single-item transitions", () => {
  it("marks one duplicate bought by ID without history", () => {
    const first = item("Eggs");
    const second = item("Eggs");
    const document = { schemaVersion: 1 as const, revision: 2, items: [first, second] };
    const result = applyCommand(document, { kind: "markBought", operationId: crypto.randomUUID(), actorSub: "a", itemId: first.id });
    expect(result.outcome).toBe("applied");
    expect(result.items).toEqual([second]);
  });

  it("returns already absent without touching another item", () => {
    const remaining = item("Milk");
    const result = applyCommand({ schemaVersion: 1, revision: 1, items: [remaining] }, { kind: "remove", operationId: crypto.randomUUID(), actorSub: "a", itemId: crypto.randomUUID() });
    expect(result).toEqual({ outcome: "already_absent", items: [remaining] });
  });
});
