import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AuthScreen } from "../../src/components/AuthScreen";

describe("AuthScreen", () => {
  it("shows live brand copy and a prominent Google sign-in action", () => {
    render(<AuthScreen denied={false} />);
    expect(screen.getByRole("img", { name: /smiling shopping cart/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /continue with google/i })).toHaveAttribute("href", "/api/auth/login");
    expect(screen.getByText(/shared grocery list/i)).toBeInTheDocument();
  });

  it("shows friendly denial without protected data", () => {
    render(<AuthScreen denied />);
    expect(screen.getByRole("alert")).toHaveTextContent(/isn’t on this list/i);
  });
});
