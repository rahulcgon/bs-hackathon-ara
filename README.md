# bs-hackathon-ara

**A polished, end-to-end test automation framework for modern e-commerce — built with WebdriverIO and a clean Page Object Model.**

![WebdriverIO](https://img.shields.io/badge/WebdriverIO-EA5906?logo=webdriverio&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Mocha](https://img.shields.io/badge/Mocha-8D6748?logo=mocha&logoColor=white)
![Allure](https://img.shields.io/badge/Allure_Report-FF4F64?logo=qameta&logoColor=white)
![Chrome](https://img.shields.io/badge/Chrome-4285F4?logo=googlechrome&logoColor=white)
![Firefox](https://img.shields.io/badge/Firefox-FF7139?logo=firefoxbrowser&logoColor=white)
![BrowserStack](https://img.shields.io/badge/BrowserStack-FF6C37?logo=browserstack&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

---

A production-grade UI test suite that exercises the [testathon.live](https://testathon.live) e-commerce store from the user's perspective. It pairs a scalable Page Object Model with cross-browser and responsive coverage, real performance metrics, and rich Allure reporting — so every run reads like a story, not a log dump. Originally crafted for a **BrowserStack hackathon**, it's structured to scale cleanly from a laptop run to a full CI grid.

## ✨ Features

- **🧱 Clean Page Object Model** — Reusable page objects (`BasePage`, `ProductListingPage`, `FilterPanel`) keep selectors and actions in one place, so specs stay readable and maintenance stays cheap.
- **🌐 Cross-Browser Coverage** — Runs the same suite across desktop **Chrome** and **Firefox** for true compatibility confidence.
- **📱 Mobile & Tablet Emulation** — Built-in device profiles for **iPhone 12 Pro** and **iPad Pro** validate the responsive shopping experience out of the box.
- **⚡ Performance Metrics Capture** — Asserts on real navigation timings like First Contentful Paint and an overall performance score, catching slowdowns before users feel them.
- **📸 Auto-Screenshots on Failure** — Every failing test snapshots the browser with a timestamped filename, turning triage into a glance.
- **🧪 Data-Driven Filter Testing** — Centralized test data powers exhaustive brand combinations and price-range scenarios from a single source of truth.
- **🛡️ Resilient Interactions** — Safe-click retry logic, smart waits, and full-page-load synchronization keep runs stable across environments.
- **📊 Allure + Spec Reporting** — Beautiful, drill-down Allure reports alongside fast, readable terminal output.
- **🚀 Parallel Execution** — Tuned `maxInstances` settings run capabilities concurrently for quick feedback loops.
- **🔁 CI-Ready** — Ships with a GitHub Actions workflow and sensible retry/timeout defaults for hands-off pipelines.

## 🧰 Tech Stack

| Layer | Technology |
| --- | --- |
| Runtime | Node.js |
| Language | JavaScript |
| Test Framework | WebdriverIO 8 + Mocha (BDD) |
| Design Pattern | Page Object Model |
| Reporting | Allure Reporter, Spec Reporter |
| Test Data | Faker |
| Target App | [testathon.live](https://testathon.live) |
| CI | GitHub Actions |

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- A local **Chrome** and **Firefox** install (used by the WebdriverIO local runner)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/rahulcgon/bs-hackathon-ara.git
cd bs-hackathon-ara

# 2. Install dependencies
npm install
```

### Run the Tests

```bash
# Run the full suite across all configured capabilities
npm run wdio
```

That's it — the runner spins up Chrome, Firefox, and the mobile/tablet emulators, executes the specs in parallel, and writes results to `allure-results/`.

### View the Allure Report

```bash
# Generate and open an interactive report
npx allure generate allure-results --clean && npx allure open
```

## 🔍 Usage

The suite targets `https://testathon.live` via the configured `baseUrl`, so specs navigate with clean relative paths:

```javascript
const ProductListingPage = require('../pageobjects/ProductListingPage');

const productListingPage = new ProductListingPage();

// Open the storefront and wait for full load
await productListingPage.open('/');

// Read product data straight from the catalog
const count = (await productListingPage.productCards).length;

// Capture real page-load performance metrics
const metrics = await productListingPage.verifyPageLoadPerformance();
expect(metrics.firstContentfulPaint).toBeLessThan(2000);
```

Data-driven scenarios pull from a single, expressive test-data module:

```javascript
const FilterTestData = require('../testdata/filterTestData');

FilterTestData.getBrandCombinations();  // iPhone, Galaxy, Pixel, OnePlus — all permutations
FilterTestData.getPriceRanges();        // Budget through ultra-premium bands
```

Failures auto-capture a screenshot — no extra wiring required:

```text
screenshots/FAILED_<test_title>_<timestamp>.png
```

## 🗂️ Project Structure

```text
bs-hackathon-ara/
├── test/
│   ├── pageobjects/
│   │   ├── BasePage.js              # Shared waits, safe-click, navigation helpers
│   │   ├── ProductListingPage.js    # Storefront catalog interactions
│   │   ├── FilterPanel.js           # Brand / price / sort filter actions
│   │   ├── login.page.js
│   │   ├── secure.page.js
│   │   └── page.js
│   ├── specs/
│   │   └── filter/
│   │       ├── basic-filtering.spec.js
│   │       ├── advanced-filter-combinations.spec.js
│   │       ├── focused-filter-testing.spec.js
│   │       ├── product-catalog.spec.js
│   │       └── discovery.spec.js
│   └── testdata/
│       └── filterTestData.js        # Centralized, data-driven test inputs
├── .github/workflows/               # CI workflow
├── wdio.conf.js                     # Capabilities, reporters, hooks
├── package.json
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Open an issue to discuss an idea, or submit a pull request — new specs, page objects, and capabilities are all great additions.

## 📄 License

Released under the **MIT License**. See [`LICENSE`](LICENSE) for details.

---

<sub>Built with ❤️ for a BrowserStack hackathon.</sub>

