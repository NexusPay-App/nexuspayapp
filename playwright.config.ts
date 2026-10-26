import { defineConfig, devices } from '@playwright/test';
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3100';
export default defineConfig({
  testDir: './tests/browser',
  use: { baseURL, browserName: 'chromium', launchOptions: process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}, serviceWorkers: 'block' },
  projects: [{ name: 'desktop', use: { ...devices['Desktop Chrome'] } }, { name: 'mobile', use: { ...devices['Pixel 7'] } }],
  webServer: { command: 'npm start -- --port 3100', url: baseURL, reuseExistingServer: !process.env.CI },
});
