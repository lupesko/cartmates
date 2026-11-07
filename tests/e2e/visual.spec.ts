import { expect, test } from "@playwright/test";
import { mockCartmates, state } from "./fixtures";

const items = [
  { id: "00000000-0000-4000-8000-000000000001", text: "Milk", creatorName: "Hagay" },
  { id: "00000000-0000-4000-8000-000000000002", text: "Eggs", creatorName: "Dana" },
  { id: "00000000-0000-4000-8000-000000000003", text: "Bananas", creatorName: "Noam" },
];

for (const width of [320, 390, 768, 1440]) {
  test(`matches the reviewed active-list composition at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width <= 390 ? 844 : 900 });
    await mockCartmates(page, state(items));
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Our Groceries" })).toBeVisible();
    await expect(page).toHaveScreenshot(`active-list-${width}.png`, { fullPage: true });
  });
}

test("matches the empty and confirmation compositions", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const backend = state();
  await mockCartmates(page, backend);
  await page.goto("/");
  await expect(page).toHaveScreenshot("empty-list-390.png", { fullPage: true });
  backend.items.push({ id: "00000000-0000-4000-8000-000000000001", text: "Milk", creatorName: "Hagay" });
  backend.revision += 1;
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(page.getByText("Milk")).toBeVisible();
  await page.getByRole("button", { name: /mark all bought/i }).click();
  await expect(page).toHaveScreenshot("mark-all-confirmation-390.png", { fullPage: true });
  await page.getByRole("button", { name: /close confirmation/i }).click();
  await page.getByRole("button", { name: /clear list/i }).click();
  await expect(page).toHaveScreenshot("clear-confirmation-390.png", { fullPage: true });
});

test("matches sign-in, loading, and error states", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/api/session", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 30_000));
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: { code: "unauthenticated", message: "Please sign in.", retryable: false } }) });
  });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Loading CartMates…")).toBeVisible();
  await expect(page).toHaveScreenshot("loading-390.png", { fullPage: true });
  await page.unrouteAll({ behavior: "ignoreErrors" });

  const signedOut = state();
  signedOut.signedIn = false;
  await mockCartmates(page, signedOut);
  await page.reload();
  await expect(page).toHaveScreenshot("sign-in-390.png", { fullPage: true });

  await page.unrouteAll({ behavior: "wait" });
  await page.route("**/api/session", async (route) => route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: { code: "service_unavailable", message: "Please try again.", retryable: true } }) }));
  await page.reload();
  await expect(page.getByRole("heading", { name: /we hit a bump/i })).toBeVisible();
  await expect(page).toHaveScreenshot("fatal-error-390.png", { fullPage: true });
});

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
