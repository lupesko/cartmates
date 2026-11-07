import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ConfirmationDialog } from "../../src/components/ConfirmationDialog";

describe("Clear confirmation", () => {
  it("uses live count and explicit destructive confirmation", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<ConfirmationDialog kind="clear" itemCount={2} pending={false} onConfirm={onConfirm} onCancel={vi.fn()} />);
    expect(screen.getByRole("heading", { name: /clear your list/i })).toBeInTheDocument();
    expect(screen.getByText(/remove all 2 items/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /yes, clear/i }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });
});
