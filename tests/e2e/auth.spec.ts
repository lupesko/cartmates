import { expect, test } from "@playwright/test";
import { mockCartmates, state } from "./fixtures";

test("signed-out and denied visitors receive friendly protected experiences", async ({ page }) => {
  const backend = state();
  backend.signedIn = false;
  await mockCartmates(page, backend);
  await page.goto("/");
  await expect(page.getByRole("link", { name: /continue with google/i })).toBeVisible();
  await page.goto("/?auth=access-denied");
  await expect(page.getByRole("alert")).toContainText("isn’t on this list");
});

test("authorized session survives refresh and can sign out", async ({ page }) => {
  const backend = state();
  await mockCartmates(page, backend);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Our Groceries" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Our Groceries" })).toBeVisible();
  await page.getByRole("button", { name: /sign out hagay/i }).click();
  await expect(page.getByRole("link", { name: /continue with google/i })).toBeVisible();
});
