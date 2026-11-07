import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ItemActionsMenu } from "../../src/components/ItemActionsMenu";

describe("ItemActionsMenu", () => {
  it("opens a labelled menu, removes, and closes on Escape", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(<ItemActionsMenu itemName="Milk" disabled={false} onRemove={onRemove} />);
    const trigger = screen.getByRole("button", { name: /actions for milk/i });
    await user.click(trigger);
    await user.click(screen.getByRole("menuitem", { name: /remove/i }));
    expect(onRemove).toHaveBeenCalledOnce();
    await user.click(trigger);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
