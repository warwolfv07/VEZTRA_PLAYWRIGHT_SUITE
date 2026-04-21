# Veztra Luxe Playwright Test Suite

Automated end-to-end test suite for [veztra.in](https://veztra.in) built with [Playwright](https://playwright.dev). Covers 72 test cases across 13 modules, running against both desktop Chrome and mobile iPhone viewports.

## Prerequisites

- **Node.js** v18 or later
- **npm** (comes with Node.js)

## Installation

```bash
npm install
npx playwright install --with-deps chromium
```

The second command downloads the Chromium browser binary that Playwright needs. Only Chromium is required by this suite.

## Quick Start

```bash
# Run all tests (desktop + mobile)
npx playwright test

# Run desktop tests only
npx playwright test --project=desktop-chrome

# Run mobile tests only
npx playwright test --project=mobile-iphone

# Run a specific module
npx playwright test -g "Module 4"

# Run a single test case by ID
npx playwright test -g "TC-001"

# Open the HTML report after a run
npx playwright show-report
```

## Debugging

### Watch a test run in the browser (headed mode)

Add `--headed` to see Chrome open and execute each step visually:

```bash
# Watch a single test (grep matches test names, not step IDs)
npx playwright test --headed --workers=1 -g "Homepage"

# Watch a whole module
npx playwright test --headed --workers=1 -g "Module 4"

# Watch a specific product test
npx playwright test --headed --workers=1 -g "golden-top.*Desktop"

# Shorthand via npm script
npm run test:headed -- -g "Homepage"
```

> **Note:** The `-g` flag matches against `test()` names, not step IDs. Use patterns like `"Homepage"`, `"Module 5"`, `"Cart — filled"`, `"Razorpay"`, or `"golden-top"`. To find exact test names, run `npx playwright test --list`.

### Playwright Inspector (step-through debugger)

Set `PWDEBUG=1` to launch the Playwright Inspector — a GUI that lets you step through each action, inspect selectors, and see the page state at every point:

```bash
# Windows CMD
set PWDEBUG=1 && npx playwright test --headed --workers=1 -g "Homepage"

# Windows PowerShell
$env:PWDEBUG=1; npx playwright test --headed --workers=1 -g "Homepage"

# Linux / macOS
PWDEBUG=1 npx playwright test --headed --workers=1 -g "Homepage"

# Shorthand
npm run test:debug -- -g "Homepage"
```

The Inspector window shows each Playwright call. Click **Step Over** to advance one action at a time, or **Resume** to continue to the next breakpoint.

### VS Code debugging with breakpoints

The project includes `.vscode/launch.json` with four debug configurations. Open VS Code, go to **Run and Debug** (Ctrl+Shift+D), and pick one:

| Configuration | What it does |
|---|---|
| **Debug All Tests (headed)** | Runs the full suite in a visible browser. VS Code breakpoints work. |
| **Debug Current File** | Runs the currently open `.spec.ts` file headed. |
| **Debug Selected Test (grep)** | Prompts for a test name/ID (e.g. `TC-001` or `Module 4`), runs only that test headed. |
| **Debug with Playwright Inspector** | Same as above but also opens the Playwright Inspector for step-by-step control. |

To use breakpoints:

1. Open `veztra.spec.ts` in VS Code
2. Click the gutter to set a red breakpoint on any line
3. Pick a debug configuration from the dropdown and press **F5**
4. Chrome opens, and execution pauses at your breakpoint
5. Use the VS Code debug toolbar to step over/into/out, inspect variables, and continue

### VS Code Playwright extension (recommended)

Install the **[Playwright Test for VS Code](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)** extension for the best experience:

- Green play buttons appear next to each `test()` block — click to run or debug a single test
- Right-click a test to **Debug Test** (uses breakpoints) or **Run Test** (headed/headless)
- Built-in test explorer sidebar with pass/fail status
- **Show Browser** checkbox to toggle headed mode
- **Pick Locator** tool to find selectors interactively on the live page

Install from VS Code: `Ctrl+Shift+X` → search "Playwright Test for VS Code" → Install.

## Project Structure

```
veztra-playwright-suite/
  playwright.config.ts      Playwright runner configuration (projects, timeouts, reporters)
  veztra.spec.ts            Main test file — all 72 test cases across 13 modules
  veztra.config.json        Runtime config (credentials, URLs, timeouts, retry counts)
  veztra.tests.json         Per-test toggle file — enable/disable individual test cases
  global-setup.ts           Pre-run setup that scrapes product URLs from the shop page
  tsconfig.json             TypeScript config for editor tooling
  package.json              Node.js dependencies
  test-artifacts/           Auto-generated scraped product data (gitignored)
  test-results/             Screenshots, traces, error context on failure (gitignored)
  playwright-report/        HTML report output (gitignored)
```

## Configuration

### veztra.config.json

The main runtime config file. Edit this to change test behaviour without touching code.

| Key | Description | Default |
|---|---|---|
| `baseUrl` | Site under test | `https://veztra.in` |
| `testUser.email` / `.password` | Registered account for auth tests. Leave blank to skip credential-gated tests (TC-102). | `""` |
| `guestCheckout.*` | Billing details used for guest checkout tests | Pre-filled with test data |
| `products.scrapeProductsFromShop` | Auto-scrape product URLs from `/shop/` before tests | `true` |
| `products.urls` | Manual product URLs (overrides scrape when non-empty) | `[]` |
| `mobileViewport` | Viewport dimensions for mobile tests | `375 x 812` |
| `timeouts.navigation` | Page navigation timeout (ms) | `30000` |
| `timeouts.cartUpdate` | Wait after cart operations (ms) | `3000` |
| `timeouts.animationSettle` | Wait after CSS animations (ms) | `1500` |
| `retries.local` | Retry count for local runs | `1` |
| `retries.ci` | Retry count in CI | `2` |

### veztra.tests.json

Toggle individual test cases on or off without code changes. Set `"enabled": "N"` to skip a test:

```json
{
  "TC-001": { "name": "Page title contains 'Veztra'", "enabled": "Y" },
  "TC-043": { "name": "Cart badge count > 0",         "enabled": "N" }
}
```

Disabled tests still appear in the HTML report as `[skipped]` so the audit trail is preserved.

## Test Modules

| # | Module | Test Cases | Description |
|---|--------|-----------|-------------|
| 1 | Homepage | TC-001 to TC-008 | Title, logo, nav, hero banner, products, sale badges, footer, cart icon, trust badges |
| 2A | Navigation (Desktop) | TC-009 to TC-015 | Logo click, nav links, footer links, breadcrumbs |
| 2B | Navigation (Mobile) | TC-M01 to TC-M12 | Mobile nav, hamburger menu, footer scroll, login form |
| 3 | Shop / Collection | TC-016 to TC-023 | Product grid, pricing, thumbnails, select options, sale badges, wishlist, pagination |
| 4 | Product Detail | TC-024 to TC-039, TC-101 | Gallery, size selector, add-to-cart, tabs, reviews, related products, size guide. Runs for each product URL. |
| 5 | Shopping Cart | TC-043 to TC-050b | Empty/filled states, badge count, qty update, remove item, proceed to checkout |
| 6 | Checkout | TC-051 to TC-057b | Form fields, validation errors, mobile layout. Supports WooCommerce Blocks checkout. |
| 7 | Authentication | TC-058 to TC-103 | Login form, register, forgot password, order history (credential-gated), guest checkout |
| 8 | Wishlist | TC-070 to TC-072 | Wishlist on product and shop pages, mobile |
| 9 | Static Pages | TC-073 to TC-078 | About, Contact, Privacy Policy, Return & Exchange, FAQs, Terms |
| 10 | Responsive / Mobile | TC-079 to TC-084 | Viewport checks, touch targets, header, no horizontal scroll |
| 11 | SEO & Accessibility | TC-085 to TC-090 | Meta description, alt text, H1 tags, Open Graph, page load time, console errors |
| 12 | Edge Cases | TC-091 to TC-094 | 404 page, direct URL access, empty cart checkout, invalid coupon |
| 13 | Razorpay Payment | TC-104a to TC-104i | Razorpay modal, payment methods, QR code, branding, close button, mobile viewport |

## Viewing Reports

After a test run, open the interactive HTML report:

```bash
npx playwright show-report
```

The report includes:
- Pass/fail status per test step
- Failure screenshots (captured automatically)
- Execution traces on first retry (open with `npx playwright show-trace <path>`)
- Skipped test annotations

## CI Integration

Set the `CI` environment variable to enable CI-specific behaviour:

```bash
CI=true npx playwright test
```

In CI mode:
- `forbidOnly` is enabled (prevents `.only` from accidentally filtering tests)
- Workers set to 1 (serial execution for stability)
- Retries use the `retries.ci` value from config (default: 2)
- Traces captured on first retry

### GitHub Actions Example

```yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test --project=desktop-chrome
      - uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: playwright-report/
```

## Troubleshooting

### Navigation timeouts

The site uses Elementor with heavy assets. All navigations use `waitUntil: 'domcontentloaded'` instead of `load` to avoid waiting for third-party scripts. If timeouts persist, increase `timeouts.navigation` in `veztra.config.json`.

### Razorpay tests skipped

Razorpay tests may be auto-skipped with a stock error like _"Not enough units in stock"_. This happens because the live site has limited inventory. The tests gracefully skip when checkout is blocked by stock validation rather than reporting a false failure.

### "Account already registered" on checkout

The guest checkout email (`guest.playwright@mailinator.com`) may conflict with a previously created account on the live site. Razorpay tests use a unique timestamped email to avoid this. If other checkout tests hit this error, change `guestCheckout.email` in `veztra.config.json`.

### Credential-gated tests skipped

TC-102 (order history) requires a registered account. Fill in `testUser.email` and `testUser.password` in `veztra.config.json` to enable it.

### Flaky tests on slow connections

Increase retries: set `retries.local` to `2` in `veztra.config.json`, or pass `--retries=2` on the command line:

```bash
npx playwright test --retries=2
```

## Architecture Notes

- **Single spec file**: All 72 tests live in `veztra.spec.ts` for simplicity. Tests within a module share one browser session to minimize navigation overhead.
- **Step runner (`S()`)**: Each assertion is wrapped in `S(id, label, fn)` which integrates with `veztra.tests.json` toggles and produces named steps in the HTML report.
- **Dual checkout support**: The suite detects WooCommerce Blocks checkout vs classic checkout at runtime and uses the appropriate selectors (aria labels vs `#billing_*` IDs).
- **Kitify/Elementor compatibility**: The site uses the Kitify theme with Elementor. Custom selectors handle ARIA radiogroup size swatches, Foundation-style tab panels, PhotoSwipe lightbox, and Elementor lazy-rendered content.
- **Product URL scraping**: `global-setup.ts` scrapes product URLs from `/shop/` before tests run, so the suite adapts if products are added or removed.
