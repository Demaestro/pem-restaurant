import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT) || 5173;
const API_PORT = Number(process.env.API_PORT) || 4000;
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  fullyParallel: true,
  reporter: process.env.CI ? "github" : [["list"]],
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chromium", use: { ...devices["Pixel 7"] } },
  ],
  webServer: process.env.PLAYWRIGHT_NO_SERVER
    ? undefined
    : [
        {
          command: `cross-env STORAGE_MODE=local PORT=${API_PORT} node server.js`,
          port: API_PORT,
          reuseExistingServer: !process.env.CI,
          timeout: 30_000,
        },
        {
          command: `npx vite --port ${PORT}`,
          port: PORT,
          reuseExistingServer: !process.env.CI,
          timeout: 30_000,
          env: { VITE_API_BASE_URL: `http://localhost:${API_PORT}` },
        },
      ],
});
