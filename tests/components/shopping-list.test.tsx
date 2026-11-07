import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { SharedListActions } from "../../src/hooks/useSharedList";
import { ShoppingList } from "../../src/components/ShoppingList";
import type { GroceryItem } from "../../shared/api-contracts";

function actions(items: readonly GroceryItem[]): SharedListActions {
  return {
    state: { list: { revision: 1, items, remainingCount: items.length, groupName: "Our Groceries" }, loading: false, pendingAction: null, message: null, retryAvailable: false },
    add: vi.fn(), markBought: vi.fn(), remove: vi.fn(), clear: vi.fn(), markAllBought: vi.fn(), retry: vi.fn(), refresh: vi.fn(),
  };
}

describe("ShoppingList", () => {
  it("renders ordered live items and an accurate count", () => {
    render(<ShoppingList session={{ user: { displayName: "Hagay", initials: "HL" }, groupName: "Our Groceries", csrfToken: "x".repeat(32) }} list={actions([{ id: crypto.randomUUID(), text: "Milk", creatorName: "Hagay" }])} onSignOut={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "Our Groceries" })).toBeInTheDocument();
    expect(screen.getByText("1 item")).toBeInTheDocument();
    expect(screen.getByText("Milk")).toBeInTheDocument();
  });

  it("renders a friendly empty state", () => {
    render(<ShoppingList session={{ user: { displayName: "Hagay", initials: "HL" }, groupName: "Our Groceries", csrfToken: "x".repeat(32) }} list={actions([])} onSignOut={vi.fn()} />);
    expect(screen.getByRole("heading", { name: /your list is ready/i })).toBeInTheDocument();
    expect(screen.getByText("0 items")).toBeInTheDocument();
  });
});
