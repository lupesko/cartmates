import { expect, test } from "@playwright/test";
import { mockCartmates, state } from "./fixtures";

test("acknowledges add input within one second", async ({ page }) => {
  await mockCartmates(page, state());
  await page.goto("/");
  const start = Date.now();
  await page.getByRole("textbox").fill("Milk");
  await page.getByRole("textbox").press("Enter");
  await expect(page.getByRole("status")).toContainText(/saving|saved/i, { timeout: 1_000 });
  expect(Date.now() - start).toBeLessThan(1_000);
});
