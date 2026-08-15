import { defineConfig, devices } from "@playwright/test";

const WEB_PORT = 3001;
const MOCK_SERVER_PORT = 3900;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${WEB_PORT}`,
    trace: "on-first-retry",
  },

  projects: [
    { name: "chromium-desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
    { name: "tablet", use: { ...devices["iPad Mini"] } },
  ],

  // e2e runs never touch the real myanilist-server / real MyAnimeList account.
  // A tiny in-memory mock (e2e/mock-server.mjs) stands in for it, so list-mutation
  // tests are free to write/delete without any risk to real user data.
  webServer: [
    {
      command: "node e2e/mock-server.mjs",
      url: `http://localhost:${MOCK_SERVER_PORT}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 15_000,
      env: { MOCK_SERVER_PORT: String(MOCK_SERVER_PORT) },
    },
    {
      command: "pnpm build && pnpm start",
      url: `http://localhost:${WEB_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: { MAL_API_BASE_URL: `http://localhost:${MOCK_SERVER_PORT}` },
    },
  ],
});
