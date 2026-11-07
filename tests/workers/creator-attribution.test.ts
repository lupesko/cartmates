import { evictDurableObject } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { addCommand } from "../fixtures/data";
import { freshList } from "../fixtures/worker";

describe("creator attribution", () => {
  it("binds each simultaneous addition to its trusted actor and preserves it", async () => {
    const stub = freshList();
    await Promise.all([stub.mutate(addCommand("Eggs", "a", "Hagay")), stub.mutate(addCommand("Eggs", "b", "Dana"))]);
    await evictDurableObject(stub);
    expect((await stub.getList()).items.map((entry) => entry.creatorName).sort()).toEqual(["Dana", "Hagay"]);
  });

  it("rejects missing trusted display names", async () => {
    expect(await freshList().mutateSafe(addCommand("Milk", "a", ""))).toMatchObject({ ok: false, error: { code: "access_denied" } });
  });
});
