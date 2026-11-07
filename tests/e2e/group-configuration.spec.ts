import { expect, test } from "@playwright/test";
import { mockCartmates, state } from "./fixtures";

test("renders configured group presentation without administration controls", async ({ page }) => {
  const backend = state();
  backend.groupName = "Office Kitchen";
  await mockCartmates(page, backend);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Office Kitchen" })).toBeVisible();
  await expect(page.getByRole("button", { name: /invite|role|admin|member/i })).toHaveCount(0);
});
