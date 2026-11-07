import { describe, expect, it } from "vitest";
import { addCommand } from "../fixtures/data";
import { freshList } from "../fixtures/worker";

describe("atomic mutation transaction", () => {
  it("stores document and receipt and replays without applying twice", async () => {
    const stub = freshList();
    const command = addCommand();
    const first = await stub.mutate(command);
    const replay = await stub.mutate(command);
    expect(first.document.items).toHaveLength(1);
    expect(replay.alreadyProcessed).toBe(true);
    expect(replay.document.items).toEqual(first.document.items);
    expect(replay.document.revision).toBe(1);
  });

  it("rejects an idempotency key reused for another command", async () => {
    const stub = freshList();
    const command = addCommand("Milk");
    await stub.mutate(command);
    const result = await stub.mutateSafe({ ...command, text: "Eggs" });
    expect(result).toMatchObject({ ok: false, error: { code: "idempotency_conflict", status: 409 } });
  });
});
