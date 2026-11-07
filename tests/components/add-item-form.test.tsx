import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AddItemForm } from "../../src/components/AddItemForm";

describe("AddItemForm", () => {
  it("submits with Enter and clears only after success", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn().mockResolvedValue(true);
    render(<AddItemForm pending={false} onAdd={onAdd} />);
    const input = screen.getByRole("textbox", { name: /add a grocery item/i });
    await user.type(input, "  Milk  {Enter}");
    expect(onAdd).toHaveBeenCalledWith("  Milk  ");
    expect(input).toHaveValue("");
  });

  it("retains failed input and rejects empty or overlength input", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn().mockResolvedValue(false);
    render(<AddItemForm pending={false} onAdd={onAdd} />);
    const input = screen.getByRole("textbox");
    await user.type(input, "Eggs{Enter}");
    expect(input).toHaveValue("Eggs");
    await user.clear(input);
    await user.type(input, "{Enter}");
    expect(screen.getByRole("alert")).toHaveTextContent(/enter an item/i);
  });
});
