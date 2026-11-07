import type { AddCommand, GroceryItem, SessionClaims } from "../../shared/api-contracts";

export const HAGAY_SESSION: SessionClaims = {
  v: 1,
  sub: "google-hagay",
  email: "hagay@example.com",
  name: "Hagay",
  csrf: "0123456789abcdef0123456789abcdef",
  iat: 2_000_000_000,
  exp: 2_000_086_400,
};

export function addCommand(text = "Milk", actorSub = "google-hagay", actorName = "Hagay"): AddCommand {
  return { kind: "add", operationId: crypto.randomUUID(), actorSub, actorName, text };
}

export function item(text = "Milk", creatorName = "Hagay"): GroceryItem {
  return { id: crypto.randomUUID(), text, creatorName };
}
