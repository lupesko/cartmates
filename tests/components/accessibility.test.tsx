import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AuthScreen } from "../../src/components/AuthScreen";
import { EmptyState } from "../../src/components/EmptyState";

describe("accessible presentation", () => {
  it("keeps decorative images out of the reading order and labels required actions", () => {
    const { rerender } = render(<AuthScreen denied={false} />);
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /continue with google/i })).toBeInTheDocument();
    rerender(<EmptyState />);
    expect(screen.getByRole("heading", { name: /your list is ready/i })).toBeInTheDocument();
  });
});
