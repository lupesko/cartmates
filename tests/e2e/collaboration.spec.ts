import { expect, test } from "@playwright/test";
import { mockCartmates, state } from "./fixtures";

test("two active members converge after simultaneous additions", async ({ browser }) => {
  const backend = state();
  const first = await browser.newPage();
  const second = await browser.newPage();
  await mockCartmates(first, backend);
  await mockCartmates(second, backend);
  await Promise.all([first.goto("/"), second.goto("/")]);
  await Promise.all([
    first.getByRole("textbox").fill("Milk").then(() => first.getByRole("textbox").press("Enter")),
    second.getByRole("textbox").fill("Eggs").then(() => second.getByRole("textbox").press("Enter")),
  ]);
  await second.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(second.getByText("Milk", { exact: true })).toBeVisible({ timeout: 5_000 });
  await expect(second.getByText("Eggs", { exact: true })).toBeVisible();
  await first.close();
  await second.close();
});

test("network failure never reports false success and retry reconciles", async ({ page }) => {
  const backend = state();
  backend.failNextMutation = true;
  await mockCartmates(page, backend);
  await page.goto("/");
  await page.getByRole("textbox").fill("Milk");
  await page.getByRole("textbox").press("Enter");
  await expect(page.getByRole("alert")).toContainText(/failed|connect|save/i);
  await page.getByRole("button", { name: /try again/i }).click();
  await expect(page.getByText("Milk", { exact: true })).toBeVisible();
});
