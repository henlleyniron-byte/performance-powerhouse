import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const baseURL = 'http://127.0.0.1:4174';
const repoRoot = fileURLToPath(new URL('../', import.meta.url));

export default defineConfig({
  testDir: './browser',
  fullyParallel: true,
  workers: 2,
  reporter: 'list',
  use: { baseURL, serviceWorkers: 'block', timezoneId: 'Asia/Colombo', trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'android-chromium', use: { ...devices['Pixel 7'] } },
    { name: 'desktop-webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: [
    {
      command: 'python3 scripts/preview-v22.py --port 4174',
      cwd: repoRoot,
      url: `${baseURL}/community-share.html`,
    },
    {
      command: 'python3 -m http.server 4175 --bind 127.0.0.1',
      cwd: repoRoot,
      url: 'http://127.0.0.1:4175/study-tracker/',
    },
  ],
});
