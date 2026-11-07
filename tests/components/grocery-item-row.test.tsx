import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { GroceryItemRow } from "../../src/components/GroceryItemRow";

describe("GroceryItemRow", () => {
  it("shows exact creator attribution and exposes bought by item name", async () => {
    const user = userEvent.setup();
    const onBought = vi.fn();
    render(<ul><GroceryItemRow item={{ id: crypto.randomUUID(), text: "חלב 🥛", creatorName: "הגי לופסקו" }} pending={false} onBought={onBought} onRemove={vi.fn()} /></ul>);
    expect(screen.getByText("Added by הגי לופסקו")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /mark חלב 🥛 as bought/i }));
    expect(onBought).toHaveBeenCalledOnce();
  });
});
