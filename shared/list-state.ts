import type { GroceryItem, MutationCommand, MutationOutcome, ShoppingListDocument } from "./api-contracts";
import { normalizeItemText, requireDisplayName, requireUuid } from "./validation";

export interface TransitionResult {
  readonly outcome: MutationOutcome;
  readonly items: readonly GroceryItem[];
}

export function applyCommand(document: ShoppingListDocument, command: MutationCommand): TransitionResult {
  switch (command.kind) {
    case "add": {
      const item: GroceryItem = {
        id: crypto.randomUUID(),
        text: normalizeItemText(command.text),
        creatorName: requireDisplayName(command.actorName),
      };
      return { outcome: "applied", items: [...document.items, item] };
    }
    case "remove":
    case "markBought": {
      const itemId = requireUuid(command.itemId, "itemId");
      const exists = document.items.some((item) => item.id === itemId);
      return exists
        ? { outcome: "applied", items: document.items.filter((item) => item.id !== itemId) }
        : { outcome: "already_absent", items: document.items };
    }
    case "clear":
    case "markAllBought":
      return document.items.length === 0
        ? { outcome: "already_empty", items: document.items }
        : { outcome: "applied", items: [] };
  }
}

export async function commandFingerprint(command: MutationCommand): Promise<string> {
  let canonical: string;
  switch (command.kind) {
    case "add": canonical = JSON.stringify([command.kind, normalizeItemText(command.text)]); break;
    case "remove":
    case "markBought": canonical = JSON.stringify([command.kind, requireUuid(command.itemId, "itemId")]); break;
    case "clear":
    case "markAllBought": canonical = JSON.stringify([command.kind]); break;
  }
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonical));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
