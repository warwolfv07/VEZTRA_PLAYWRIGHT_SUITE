/**
 * global-setup.ts
 * ───────────────
 * Runs once before any test project. If `scrapeProductsFromShop` is true (and
 * no manual product URLs are provided in veztra.config.json), it launches a
 * headless browser, visits the /shop/ page, extracts every product URL, and
 * writes them to test-artifacts/scraped-products.json so the spec file can
 * read them synchronously at collection time.
 */

import { chromium, FullConfig } from '@playwright/test';
import * as fs   from 'fs';
import * as path from 'path';

export default async function globalSetup(_config: FullConfig) {
  const configPath = path.resolve(__dirname, 'veztra.config.json');

  let cfg: any = {};
  try {
    cfg = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch {
    console.warn('[global-setup] veztra.config.json not found — skipping product scrape');
    return;
  }

  const BASE_URL   = (cfg.baseUrl || 'https://veztra.in').replace(/\/$/, '');
  const manualUrls = cfg.products?.urls ?? [];
  const shouldScrape = cfg.products?.scrapeProductsFromShop ?? true;

  const artifactsDir  = path.resolve(__dirname, 'test-artifacts');
  const scrapedFile   = path.join(artifactsDir, 'scraped-products.json');

  // ── If manual URLs are provided, write them as-is and skip scrape ──────────
  if (Array.isArray(manualUrls) && manualUrls.filter(Boolean).length > 0) {
    console.log(`[global-setup] Using ${manualUrls.length} manual product URL(s) from config`);
    fs.mkdirSync(artifactsDir, { recursive: true });
    fs.writeFileSync(scrapedFile, JSON.stringify({
      source:     'config',
      scrapedAt:  new Date().toISOString(),
      urls:       manualUrls,
    }, null, 2));
    return;
  }

  if (!shouldScrape) {
    console.log('[global-setup] scrapeProductsFromShop=false — will use fallback URLs in spec');
    return;
  }

  // ── Scrape the /shop/ page ─────────────────────────────────────────────────
  console.log(`[global-setup] Scraping product URLs from ${BASE_URL}/shop/ …`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page    = await context.newPage();

  try {
    await page.goto(`${BASE_URL}/shop/`, { waitUntil: 'domcontentloaded', timeout: 20_000 });

    const urls: string[] = await page.evaluate(() => {
      const anchors = document.querySelectorAll<HTMLAnchorElement>(
        'ul.products .woocommerce-loop-product__link, ul.products a.woocommerce-LoopProduct-link'
      );
      return [...new Set(Array.from(anchors).map(a => a.href).filter(Boolean))];
    });

    if (urls.length === 0) {
      console.warn('[global-setup] No product URLs found — spec will fall back to hardcoded list');
    } else {
      console.log(`[global-setup] Found ${urls.length} product(s):`, urls);
      fs.mkdirSync(artifactsDir, { recursive: true });
      fs.writeFileSync(scrapedFile, JSON.stringify({
        source:    'scrape',
        scrapedAt: new Date().toISOString(),
        shopUrl:   `${BASE_URL}/shop/`,
        urls,
      }, null, 2));
    }
  } catch (err) {
    console.error('[global-setup] Scrape failed:', err);
  } finally {
    await browser.close();
  }
}
