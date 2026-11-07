import { expect, test } from "@playwright/test";
import { mockCartmates, state } from "./fixtures";

test("adds trimmed duplicates by keyboard and preserves failed input", async ({ page }) => {
  const backend = state();
  await mockCartmates(page, backend);
  await page.goto("/");
  const input = page.getByRole("textbox", { name: /add a grocery item/i });
  await input.fill("  Milk  ");
  await input.press("Enter");
  await expect(page.getByText("Milk", { exact: true })).toBeVisible();
  await expect(page.getByText("Added by Hagay")).toBeVisible();
  await input.fill("Milk");
  await page.getByRole("button", { name: "Add item" }).click();
  await expect(page.getByText("Milk", { exact: true })).toHaveCount(2);
  await input.fill(" ");
  await input.press("Enter");
  await expect(page.getByRole("alert")).toContainText("Enter an item name");
});
