import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { GroceryItemRow } from "../../src/components/GroceryItemRow";

describe("Mark one item bought", () => {
  it("targets one stable duplicate and locks the 44px control while pending", async () => {
    const user = userEvent.setup();
    const bought = vi.fn();
    const item = { id: "00000000-0000-4000-8000-000000000001", text: "Eggs", creatorName: "Dana" };
    const { rerender } = render(<ul><GroceryItemRow item={item} pending={false} onBought={bought} onRemove={vi.fn()} /></ul>);
    const control = screen.getByRole("button", { name: "Mark Eggs as bought" });
    await user.click(control);
    expect(bought).toHaveBeenCalledOnce();
    rerender(<ul><GroceryItemRow item={item} pending onBought={bought} onRemove={vi.fn()} /></ul>);
    expect(control).toBeDisabled();
    expect(control).toHaveClass("bought-control");
  });
});
