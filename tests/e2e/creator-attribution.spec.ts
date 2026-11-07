import { expect, test } from "@playwright/test";
import { mockCartmates, state } from "./fixtures";

test("identical items retain independent creator attribution", async ({ page }) => {
  const backend = state([
    { id: crypto.randomUUID(), text: "Eggs", creatorName: "Hagay" },
    { id: crypto.randomUUID(), text: "Eggs", creatorName: "Dana אבג" },
  ]);
  await mockCartmates(page, backend);
  await page.goto("/");
  await expect(page.getByText("Added by Hagay")).toBeVisible();
  await expect(page.getByText("Added by Dana אבג")).toBeVisible();
  await page.getByRole("button", { name: /mark eggs as bought/i }).first().click();
  await expect(page.getByText("Eggs", { exact: true })).toHaveCount(1);
  await expect(page.getByText("Added by Dana אבג")).toBeVisible();
});
