import { defineConfig, devices } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// ── Load veztra.config.json ──────────────────────────────────────────────────
const configPath = path.resolve(__dirname, 'veztra.config.json');
let cfg: any = {};
try {
  cfg = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
} catch {
  console.warn('[playwright.config] veztra.config.json not found — using defaults');
}

const BASE_URL = (cfg.baseUrl || 'https://veztra.in').replace(/\/$/, '');
const retries  = process.env.CI
  ? (cfg.retries?.ci    ?? 2)
  : (cfg.retries?.local ?? 0);

// ── Config ───────────────────────────────────────────────────────────────────
export default defineConfig({
  testDir: '.',
  testMatch: 'veztra.spec.ts',

  /* Run each test file serially inside a project; tests within a file in parallel */
  fullyParallel: true,
  forbidOnly:    !!process.env.CI,
  retries,
  workers:       process.env.CI ? 1 : undefined,
  timeout:       120_000,

  /* Reporters */
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],

  /* Shared settings for all projects */
  use: {
    baseURL:            BASE_URL,
    trace:              'on-first-retry',
    screenshot:         'only-on-failure',
    video:              'off',
    navigationTimeout:  cfg.timeouts?.navigation    ?? 30_000,
    actionTimeout:      15_000,
  },

  /* Run global setup once before all tests to scrape product URLs */
  globalSetup: './global-setup.ts',

  /* Two projects: desktop Chrome and mobile iPhone 12 */
  projects: [
    {
      name: 'desktop-chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'mobile-iphone',
      use: {
        ...devices['iPhone 12'],
        viewport: cfg.mobileViewport ?? { width: 375, height: 812 },
      },
    },
  ],
});