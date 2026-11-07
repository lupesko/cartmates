import { expect, test } from "@playwright/test";
import { mockCartmates, state } from "./fixtures";

test("clear and mark-all require confirmation and act atomically", async ({ page }) => {
  const backend = state([{ id: crypto.randomUUID(), text: "Milk", creatorName: "Hagay" }]);
  await mockCartmates(page, backend);
  await page.goto("/");
  await page.getByRole("button", { name: /mark all bought/i }).click();
  await expect(page.getByRole("heading", { name: /mark all items as bought/i })).toBeVisible();
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByText("Milk", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /clear list/i }).click();
  await page.getByRole("button", { name: /yes, clear/i }).click();
  await expect(page.getByRole("heading", { name: /your list is ready/i })).toBeVisible();
});
