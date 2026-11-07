import { expect, test } from "@playwright/test";
import { mockCartmates, state } from "./fixtures";

const items = [
  { id: "00000000-0000-4000-8000-000000000001", text: "Milk", creatorName: "Hagay" },
  { id: "00000000-0000-4000-8000-000000000002", text: "Eggs", creatorName: "Dana" },
  { id: "00000000-0000-4000-8000-000000000003", text: "Bananas", creatorName: "Noam" },
];

for (const width of [390, 768, 1440]) {
  test(`matches the reviewed active-list composition at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width <= 390 ? 844 : 900 });
    await mockCartmates(page, state(items));
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Our Groceries" })).toBeVisible();
    await expect(page).toHaveScreenshot(`active-list-${width}.png`, { fullPage: true });
  });
}

test("matches item menu and recoverable network error states", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const backend = state(items);
  await mockCartmates(page, backend);
  await page.goto("/");
  await page.getByRole("button", { name: /actions for milk/i }).click();
  await expect(page).toHaveScreenshot("item-menu-390.png", { fullPage: true });
  await page.keyboard.press("Escape");
  backend.failNextMutation = true;
  await page.getByRole("button", { name: /mark milk as bought/i }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page).toHaveScreenshot("network-error-390.png", { fullPage: true });
});
