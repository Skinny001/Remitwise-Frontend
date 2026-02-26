import { defineConfig, devices } from '@playwright/test';
import path from 'path';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    extraHTTPHeaders: {
      'x-playwright-test': 'true',
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,

    // 🔥 THIS FIXES YOUR ISSUE
    cwd: path.resolve(__dirname),
    env: {
      SESSION_PASSWORD:
        'supersecurelongsessionpasswordatleast32characters!!',
      AUTH_SECRET: 'test-secret-for-local-dev-only',
    },
  },
});