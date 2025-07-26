const { browser, $ } = require('@wdio/globals');

/**
 * Base page object containing all methods, selectors and functionality
 * that is shared across all page objects for testathon.live filter testing
 */
class BasePage {
    /**
     * Open a page with the given path
     * @param {string} path - Path to navigate to (relative to baseUrl)
     */
    async open(path = '/') {
        await browser.url(path);
        await this.waitForPageLoad();
    }

    /**
     * Wait for page to be fully loaded
     */
    async waitForPageLoad() {
        await browser.waitUntil(
            async () => await browser.execute(() => document.readyState === 'complete'),
            {
                timeout: 10000,
                timeoutMsg: 'Page did not load within 10 seconds'
            }
        );
    }

    /**
     * Get the current page title
     */
    async getPageTitle() {
        return await browser.getTitle();
    }

    /**
     * Get the current URL
     */
    async getCurrentUrl() {
        return await browser.getUrl();
    }

    /**
     * Scroll to element
     * @param {WebdriverIO.Element} element - Element to scroll to
     */
    async scrollToElement(element) {
        await element.scrollIntoView();
        await browser.pause(500); // Small pause for smooth scrolling
    }

    /**
     * Wait for element to be visible and clickable
     * @param {WebdriverIO.Element} element - Element to wait for
     * @param {number} timeout - Timeout in milliseconds
     */
    async waitForElementClickable(element, timeout = 5000) {
        await element.waitForDisplayed({ timeout });
        await element.waitForClickable({ timeout });
    }

    /**
     * Safe click method with retry logic
     * @param {WebdriverIO.Element} element - Element to click
     * @param {number} retries - Number of retry attempts
     */
    async safeClick(element, retries = 3) {
        for (let i = 0; i < retries; i++) {
            try {
                await this.waitForElementClickable(element);
                await element.click();
                return;
            } catch (error) {
                if (i === retries - 1) throw error;
                await browser.pause(1000);
            }
        }
    }

    /**
     * Get text content from element with retry logic
     * @param {WebdriverIO.Element} element - Element to get text from
     */
    async getElementText(element) {
        await element.waitForDisplayed();
        return await element.getText();
    }

    /**
     * Type text with clearing existing content
     * @param {WebdriverIO.Element} element - Input element
     * @param {string} text - Text to type
     */
    async typeText(element, text) {
        await this.waitForElementClickable(element);
        await element.clearValue();
        await element.setValue(text);
    }

    /**
     * Check if element is displayed
     * @param {WebdriverIO.Element} element - Element to check
     */
    async isElementDisplayed(element) {
        try {
            return await element.isDisplayed();
        } catch (error) {
            return false;
        }
    }

    /**
     * Wait for elements to appear or disappear
     * @param {WebdriverIO.Element[]} elements - Array of elements to wait for
     * @param {boolean} shouldAppear - Whether elements should appear (true) or disappear (false)
     */
    async waitForElements(elements, shouldAppear = true) {
        const timeout = 10000;
        await browser.waitUntil(
            async () => {
                const results = await Promise.all(
                    elements.map(element => this.isElementDisplayed(element))
                );
                return shouldAppear ? results.every(Boolean) : results.every(result => !result);
            },
            {
                timeout,
                timeoutMsg: `Elements did not ${shouldAppear ? 'appear' : 'disappear'} within ${timeout}ms`
            }
        );
    }

    /**
     * Capture performance metrics
     */
    async capturePerformanceMetrics() {
        const metrics = await browser.execute(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            return {
                domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
                firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
                firstContentfulPaint: performance.getEntriesByType('paint')[1]?.startTime || 0
            };
        });
        return metrics;
    }

    /**
     * Measure response time for a given action
     * @param {Function} action - Async function to measure
     * @returns {Object} - Object containing response time and result
     */
    async measureResponseTime(action) {
        const startTime = Date.now();
        const result = await action();
        const endTime = Date.now();
        return {
            responseTime: endTime - startTime,
            result: result
        };
    }

    /**
     * Check if running on mobile device
     */
    async isMobileDevice() {
        const windowSize = await browser.getWindowSize();
        return windowSize.width <= 768;
    }

    /**
     * Check if running on tablet device
     */
    async isTabletDevice() {
        const windowSize = await browser.getWindowSize();
        return windowSize.width > 768 && windowSize.width <= 1024;
    }

    /**
     * Simulate network condition for performance testing
     * @param {string} condition - 'slow3G', 'fast3G', 'offline'
     */
    async setNetworkCondition(condition) {
        const conditions = {
            slow3G: {
                offline: false,
                downloadThroughput: 500 * 1024 / 8,
                uploadThroughput: 500 * 1024 / 8,
                latency: 400
            },
            fast3G: {
                offline: false,
                downloadThroughput: 1600 * 1024 / 8,
                uploadThroughput: 750 * 1024 / 8,
                latency: 150
            },
            offline: {
                offline: true,
                downloadThroughput: 0,
                uploadThroughput: 0,
                latency: 0
            }
        };

        if (conditions[condition]) {
            await browser.throttle(conditions[condition]);
        }
    }

    /**
     * Take screenshot for debugging
     * @param {string} filename - Optional filename
     */
    async takeScreenshot(filename) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const screenshotName = filename || `debug_screenshot_${timestamp}.png`;
        await browser.saveScreenshot(`./screenshots/${screenshotName}`);
        return screenshotName;
    }
}

module.exports = BasePage; 