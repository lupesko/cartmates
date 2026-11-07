import { AppError, type GroceryItem, type ShoppingListDocument } from "./api-contracts";
import { assertExactKeys, assertPlainObject, isUuid, requireDisplayName } from "./validation";

export const EMPTY_LIST: ShoppingListDocument = { schemaVersion: 1, revision: 0, items: [] };

function parseItem(record: Record<string, unknown>): GroceryItem {
  assertExactKeys(record, ["type", "id", "text", "creatorName"]);
  if (record.type !== "item" || typeof record.id !== "string" || !isUuid(record.id) || typeof record.text !== "string") {
    throw new AppError("internal_error", 500, "Stored list is invalid");
  }
  // Stored text was validated on write. Recheck its structural boundaries without trimming it.
  if (record.text.length === 0 || record.text !== record.text.trim() || [...record.text].length > 200 || /[\u0000-\u001f\u007f]/u.test(record.text)) {
    throw new AppError("internal_error", 500, "Stored list is invalid");
  }
  return { id: record.id.toLowerCase(), text: record.text, creatorName: requireDisplayName(record.creatorName) };
}

export function parseListDocument(source: string | undefined): ShoppingListDocument {
  if (source === undefined || source === "") return EMPTY_LIST;
  const lines = source.split("\n");
  if (lines.at(-1) === "") lines.pop();
  if (lines.length === 0) return EMPTY_LIST;
  let meta: { schemaVersion: 1; revision: number } | undefined;
  const items: GroceryItem[] = [];
  const ids = new Set<string>();
  for (const [index, line] of lines.entries()) {
    let record: unknown;
    try { record = JSON.parse(line); } catch { throw new AppError("internal_error", 500, "Stored list is invalid"); }
    assertPlainObject(record, "Stored list is invalid");
    if (index === 0) {
      assertExactKeys(record, ["type", "schemaVersion", "revision"]);
      if (record.type !== "meta" || record.schemaVersion !== 1 || !Number.isSafeInteger(record.revision) || (record.revision as number) < 0) {
        throw new AppError("internal_error", 500, "Stored list is invalid");
      }
      meta = { schemaVersion: 1, revision: record.revision as number };
      continue;
    }
    const item = parseItem(record);
    if (ids.has(item.id)) throw new AppError("internal_error", 500, "Stored list is invalid");
    ids.add(item.id);
    items.push(item);
  }
  if (meta === undefined) throw new AppError("internal_error", 500, "Stored list is invalid");
  return { ...meta, items };
}

export function serializeListDocument(document: ShoppingListDocument): string {
  if (document.schemaVersion !== 1 || !Number.isSafeInteger(document.revision) || document.revision < 0) {
    throw new AppError("internal_error", 500, "List cannot be serialized");
  }
  const seen = new Set<string>();
  const records: unknown[] = [{ type: "meta", schemaVersion: 1, revision: document.revision }];
  for (const item of document.items) {
    if (!isUuid(item.id) || seen.has(item.id) || item.text !== item.text.trim() || item.text.length === 0 ||
        [...item.text].length > 200 || /[\u0000-\u001f\u007f]/u.test(item.text)) {
      throw new AppError("internal_error", 500, "List cannot be serialized");
    }
    seen.add(item.id);
    records.push({ type: "item", id: item.id, text: item.text, creatorName: requireDisplayName(item.creatorName) });
  }
  return `${records.map((record) => JSON.stringify(record)).join("\n")}\n`;
}
