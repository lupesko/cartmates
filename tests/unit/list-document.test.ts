import { describe, expect, it } from "vitest";
import { EMPTY_LIST, parseListDocument, serializeListDocument } from "../../shared/list-document";
import { item } from "../fixtures/data";

describe("NDJSON list document", () => {
  it("treats missing state as an empty version-one document", () => {
    expect(parseListDocument(undefined)).toEqual(EMPTY_LIST);
  });

  it("round trips ordered duplicate text with distinct IDs and creators", () => {
    const document = { schemaVersion: 1 as const, revision: 7, items: [item("Eggs", "Hagay"), item("Eggs", "Dana")] };
    expect(parseListDocument(serializeListDocument(document))).toEqual(document);
  });

  it.each([
    '{"type":"meta","schemaVersion":2,"revision":0}\n',
    '{"type":"item","id":"bad","text":"Milk","creatorName":"Hagay"}\n',
    '{"type":"meta","schemaVersion":1,"revision":-1}\n',
    '{not-json}\n',
  ])("rejects corrupt documents", (source) => expect(() => parseListDocument(source)).toThrow());

  it("rejects duplicate IDs", () => {
    const same = item();
    expect(() => serializeListDocument({ schemaVersion: 1, revision: 1, items: [same, same] })).toThrow();
  });
});
