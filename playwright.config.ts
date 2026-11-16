import { defineConfig, devices } from "@playwright/test";

const port = 3100;

// Make .env.local visible to the teardown (Next loads it itself for the server).
try {
  process.loadEnvFile(".env.local");
} catch {
  // No .env.local: auth e2e tests cannot run without Supabase configured.
}

export default defineConfig({
  testDir: "e2e",
  globalTeardown: "./e2e/global-teardown.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: { baseURL: `http://localhost:${port}`, trace: "on-first-retry" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `npm run dev -- --port ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
