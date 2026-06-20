# bs-hackathon-ara

A WebdriverIO end-to-end test suite that exercises the product filtering on [testathon.live](https://testathon.live), built for a BrowserStack hackathon.

## What this is

This repo is a UI automation project written with [WebdriverIO](https://webdriver.io/) (v8) and Mocha. It drives a real browser against `https://testathon.live` (the BrowserStack demo e-commerce store) and tries to verify the product catalog and its brand/price/sort filters across desktop and emulated mobile/tablet viewports.

The bulk of the value is in the page objects and the filter specs. A fair amount of the suite is written defensively, because the filter UI on the target site does not actually behave like a normal filtered catalog, so several tests are really documenting "this is what should happen vs. what does happen" rather than asserting hard pass/fail. See the notes section at the bottom for the honest caveats.

## What it does

- Opens `testathon.live` and waits for the product grid (`.shelf-container` / `.shelf-item`) to render.
- Reads each product card to pull title, price, and a brand guessed from the title (iPhone / Galaxy / Pixel / OnePlus).
- Attempts to apply brand filters, price ranges, sorting, and view toggles through a `FilterPanel` page object.
- Verifies that the products shown match the filter criteria (brand membership, price bounds).
- Captures basic page-load performance metrics (DOM content loaded, first paint, FCP) and a rough performance score.
- Takes a screenshot automatically on any test failure (saved to `./screenshots/`).
- Runs the same specs across four capabilities: desktop Chrome, desktop Firefox, mobile Chrome (iPhone 12 Pro emulation), and tablet Chrome (iPad Pro emulation).

## Project structure

```
wdio.conf.js                      WebdriverIO config: capabilities, baseUrl, reporters, failure-screenshot hook
package.json                      Dependencies and the single "wdio" script

test/
  pageobjects/
    BasePage.js                   Shared helpers: open/wait, safe click w/ retry, typing, perf metrics,
                                    network throttling, device-size checks, screenshot
    FilterPanel.js                Filter interactions (extends BasePage): brand checkboxes, price inputs,
                                    sort dropdown, view toggle, pagination, clear/apply, filter-state readers
    ProductListingPage.js         Product catalog (extends BasePage): read cards, parse price/brand,
                                    filter-in-memory helpers, add-to-cart, performance checks
    page.js / login.page.js /     Leftover WDIO boilerplate that points at the-internet.herokuapp.com,
    secure.page.js                 NOT used by the testathon specs

  specs/
    filter/
      basic-filtering.spec.js              Single-brand filtering, clear-all, filter-state, perf, slow-3G
      advanced-filter-combinations.spec.js Multi-brand combinations; largely documents non-functional state
      focused-filter-testing.spec.js       Targeted cases (3.1.1 single brand, 3.2.1 multi-brand)
      discovery.spec.js                    DOM-discovery scratch test: dumps selectors/elements to the log
      product-catalog.spec.js              Product catalog checks
    main.js                                Standalone script with faker + a Slack-webhook reporter stub (see notes)

  testdata/
    filterTestData.js             Brands, brand combinations, price ranges, boundary values, test config
```

## How to run it

### Requirements

- Node.js 16+ (WDIO 8 needs a reasonably current Node).
- A locally installed **Chrome** and **Firefox**, since the config runs against both. WebdriverIO 8 auto-manages the matching browser drivers for you.
- Network access to `https://testathon.live`.

### Setup

```bash
git clone https://github.com/rahulcgon/bs-hackathon-ara.git
cd bs-hackathon-ara
npm install
```

You may also want to create the output directories the suite writes into, since they are not created automatically:

```bash
mkdir -p screenshots allure-results
```

### Run

```bash
npm run wdio
```

That runs `wdio run ./wdio.conf.js`, which picks up everything matching `./test/specs/**/*.js` and runs it across all four capabilities defined in `wdio.conf.js`.

### Reports

- Console output uses the `spec` reporter.
- Allure results are written to `allure-results/`. To view them you need the Allure CLI installed separately (it is not a dependency here), e.g. `allure serve allure-results`.

### Environment variables

There are none. `baseUrl` (`https://testathon.live`) is hardcoded in `wdio.conf.js`, and there is no `.env` or config for credentials, BrowserStack keys, or a Slack webhook. If you want to point at a different host, edit `baseUrl` directly.

## Notes and known rough edges

This project was put together quickly for a hackathon, and it shows. Being upfront about it:

- **The filters on the target site are effectively non-functional**, and the suite knows this. `advanced-filter-combinations.spec.js` and `focused-filter-testing.spec.js` are written to compute the *expected* filtered result and then document that the live site does not actually filter (product count stays the same). Treat these as exploratory/documentation tests, not green-or-red regression tests.
- **The `FilterPanel` selectors are guesses.** They are long OR-chains of `data-testid`, class, and label selectors (and some use XPath-style `contains(text(),...)` inside CSS, which WDIO will not parse). Many filter methods are wrapped in try/catch that just logs a warning and moves on, so they can silently no-op.
- **`test/specs/main.js` will almost certainly break the run.** It lives under `test/specs/`, so the glob picks it up, but it `require`s `axios` (not in `package.json`) and contains an unfinished `sendResultsToSlack` with a literal `'Insert your Slack webhook url'` placeholder. Move it out of `test/specs/` or finish/remove it before relying on the suite.
- **`cypress` is listed as a devDependency but there are no Cypress tests** anywhere in the repo. It is dead weight and can be removed.
- **`faker` is pinned to `5.5.3`** (the last release before the package was deprecated/sabotaged). It is imported in `filterTestData.js` and `main.js` but barely used.
- **No browser-driver or BrowserStack service is configured.** `services` is commented out in `wdio.conf.js`, so this runs locally only despite being a "BrowserStack hackathon" repo. There is no BrowserStack capability/credentials wiring.
- **`discovery.spec.js` is a scratchpad**, not a test. It walks the DOM and prints what it finds. Useful for figuring out selectors, noisy in a CI run.
- **Leftover boilerplate:** `page.js`, `login.page.js`, and `secure.page.js` are the default WDIO starter files pointing at `the-internet.herokuapp.com` and are unrelated to the testathon work.
- **`.github/workflows/datadog-synthetics.yml` is the unmodified GitHub template** and requires `DD_API_KEY` / `DD_APP_KEY` secrets that are not set up. It does not run this WDIO suite.
- **`test.txt`** contains the string `dlaskpo` and can be deleted.
- **Output dirs** (`screenshots/`, `allure-results/`) are referenced by hooks but not created by the suite, so create them first or expect a failure when the failure-screenshot hook fires.

