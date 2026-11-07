import { cloudflareTest } from "@cloudflare/vitest-plugin";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [cloudflareTest({
    wrangler: { configPath: "./wrangler.state.jsonc" },
    miniflare: {
      bindings: {
        APP_ORIGIN: "https://cartmates.test",
        GROUP_DISPLAY_NAME: "Our Groceries",
        GOOGLE_CLIENT_ID: "test-client",
        GOOGLE_CLIENT_SECRET: "test-secret",
        ALLOWED_EMAILS: "hagay@example.com,dana@example.com",
        SESSION_ENCRYPTION_KEY: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      },
    },
  })],
  test: {
    include: ["tests/workers/**/*.test.ts", "tests/contract/**/*.test.ts"],
  },
});
