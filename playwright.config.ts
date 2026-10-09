import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  timeout: 300000,
  workers: 1,
  expect: { timeout: 15000 },
  use: {
    baseURL: "http://127.0.0.1:5173",
    headless: true,
    launchOptions: { args: ["--enable-webgl", "--ignore-gpu-blocklist"] },
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1100, height: 760 },
      },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: true,
    timeout: 30000,
  },
});
