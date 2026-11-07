import { expect, test } from "@playwright/test";
import { mockCartmates, state } from "./fixtures";

test("all primary actions work by keyboard and modal focus returns", async ({ page }) => {
  await mockCartmates(page, state([{ id: crypto.randomUUID(), text: "Milk", creatorName: "Hagay" }]));
  await page.goto("/");
  await page.getByRole("button", { name: /mark all bought/i }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.getByRole("button", { name: /mark all bought/i })).toBeFocused();
});
