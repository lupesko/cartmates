import { defineConfig, devices } from "@playwright/test";

const localBrowser = process.env.PLAYWRIGHT_USE_SYSTEM_CHROME === "1" ? { channel: "chrome" as const } : {};

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "test-results",
  snapshotPathTemplate: "{testDir}/{testFilePath}-snapshots/{arg}-{projectName}{ext}",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  expect: {
    toHaveScreenshot: { animations: "disabled", scale: "css", maxDiffPixelRatio: 0.03 },
  },
  use: {
    baseURL: "http://127.0.0.1:4173",
    headless: process.env.PLAYWRIGHT_HEADED !== "1",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    ...localBrowser,
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
});
