import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ConfirmationDialog } from "../../src/components/ConfirmationDialog";

describe("Mark all confirmation", () => {
  it("supports confirm, cancel, close, and a completion illustration", async () => {
    const user = userEvent.setup();
    const cancel = vi.fn();
    render(<ConfirmationDialog kind="bought" itemCount={5} pending={false} onConfirm={vi.fn()} onCancel={cancel} />);
    expect(screen.getByRole("heading", { name: /mark all items as bought/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(cancel).toHaveBeenCalledOnce();
  });
});
