import { expect, test } from "@playwright/test";
import { mockCartmates, state } from "./fixtures";

for (const width of [320, 390, 768, 1440]) {
  test(`core controls remain reachable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width <= 390 ? 640 : 900 });
    await mockCartmates(page, state([{ id: crypto.randomUUID(), text: "Very long grocery item that wraps without covering its actions", creatorName: "A creator with a long display name אבג" }]));
    await page.goto("/");
    await expect(page.getByRole("textbox")).toBeInViewport();
    await expect(page.getByRole("button", { name: /mark .* as bought/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /clear list/i })).toBeInViewport();
    expect(await page.locator("body").evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  });
}
