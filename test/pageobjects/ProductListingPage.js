const { $, $$ } = require('@wdio/globals');
const BasePage = require('./BasePage');

/**
 * Product Listing Page Object for testathon.live
 * Handles all interactions with the main product catalog page
 */
class ProductListingPage extends BasePage {
    
    // Page Selectors
    get productGrid() {
        return $('.shelf-container');
    }

    get productCards() {
        return $$('.shelf-item');
    }

    get productTitles() {
        return $$('.shelf-item__title');
    }

    get productPrices() {
        return $$('.shelf-item__price');
    }

    get addToCartButtons() {
        return $$('.shelf-item__buy-btn');
    }

    get productCounter() {
        return $('.products-found');
    }

    get noResultsMessage() {
        return $('.no-results, .empty-state');
    }

    get loadingSpinner() {
        return $('.loading, .spinner');
    }

    // Cart Elements
    get cartIcon() {
        return $('.float-cart, .bag');
    }

    get cartCounter() {
        return $('.bag__quantity');
    }

    // Navigation Elements
    get homeLink() {
        return $('a[href="/"], a[href="#home"], .logo');
    }

    get offersLink() {
        return $('a[contains(text(),"Offers")]');
    }

    get ordersLink() {
        return $('a[contains(text(),"Orders")]');
    }

    get favouritesLink() {
        return $('a[contains(text(),"Favourites")]');
    }

    get signInLink() {
        return $('a[contains(text(),"Sign In")]');
    }

    /**
     * Navigate to the product listing page
     */
    async open() {
        await super.open('/');
        await this.waitForProductsToLoad();
    }

    /**
     * Wait for products to load on the page
     */
    async waitForProductsToLoad() {
        // Wait for loading to disappear if present
        try {
            await this.loadingSpinner.waitForDisplayed({ timeout: 2000 });
            await this.loadingSpinner.waitForDisplayed({ timeout: 10000, reverse: true });
        } catch (error) {
            // Loading spinner might not be present, continue
        }
        
        // Wait for product grid to appear
        await this.productGrid.waitForDisplayed({ timeout: 10000 });
        
        // Wait for at least one product card to appear
        await browser.waitUntil(
            async () => {
                const cards = await this.productCards;
                return cards.length > 0;
            },
            {
                timeout: 10000,
                timeoutMsg: 'No product cards found within 10 seconds'
            }
        );
    }

    /**
     * Get all product information from the current page
     */
    async getAllProducts() {
        await this.waitForProductsToLoad();
        
        const productCards = await this.productCards;
        const products = [];

        for (let i = 0; i < productCards.length; i++) {
            const card = productCards[i];
            
            try {
                // Get product title
                const titleElement = await card.$('.shelf-item__title');
                const title = await this.getElementText(titleElement);
                
                // Get product price
                const priceElement = await card.$('.shelf-item__price .val');
                const priceText = await this.getElementText(priceElement);
                const price = this.extractPriceValue(priceText);
                
                // Get product brand (extracted from title)
                const brand = this.extractBrandFromTitle(title);
                
                // Check if add to cart button is available
                const addToCartElement = await card.$('.shelf-item__buy-btn');
                const isAvailable = await this.isElementDisplayed(addToCartElement);
                
                products.push({
                    index: i,
                    title: title,
                    brand: brand,
                    price: price,
                    priceText: priceText,
                    isAvailable: isAvailable,
                    element: card
                });
            } catch (error) {
                console.warn(`Error parsing product at index ${i}:`, error.message);
            }
        }
        
        return products;
    }

    /**
     * Get the current product count
     */
    async getProductCount() {
        const products = await this.productCards;
        return products.length;
    }

    /**
     * Get displayed product count from counter element
     */
    async getDisplayedProductCount() {
        try {
            const counterText = await this.getElementText(this.productCounter);
            const match = counterText.match(/(\d+)/);
            return match ? parseInt(match[1]) : 0;
        } catch (error) {
            // If no counter element, return actual product count
            return await this.getProductCount();
        }
    }

    /**
     * Extract numeric price value from price text
     * @param {string} priceText - Text containing price (e.g., "$799.00")
     */
    extractPriceValue(priceText) {
        if (!priceText) return 0;
        
        // Remove currency symbols and extract numeric value
        const numericPrice = priceText.replace(/[$,]/g, '').match(/[\d.]+/);
        return numericPrice ? parseFloat(numericPrice[0]) : 0;
    }

    /**
     * Extract brand name from product title
     * @param {string} title - Product title
     */
    extractBrandFromTitle(title) {
        if (!title) return 'Unknown';
        
        const brandKeywords = {
            'iPhone': 'iPhone',
            'Galaxy': 'Galaxy',
            'Pixel': 'Pixel',
            'OnePlus': 'OnePlus',
            'One Plus': 'OnePlus'
        };
        
        for (const [keyword, brand] of Object.entries(brandKeywords)) {
            if (title.toLowerCase().includes(keyword.toLowerCase())) {
                return brand;
            }
        }
        
        return 'Unknown';
    }

    /**
     * Get products filtered by brand
     * @param {string} brand - Brand name to filter by
     */
    async getProductsByBrand(brand) {
        const allProducts = await this.getAllProducts();
        return allProducts.filter(product => 
            product.brand.toLowerCase() === brand.toLowerCase()
        );
    }

    /**
     * Get products within price range
     * @param {number} minPrice - Minimum price
     * @param {number} maxPrice - Maximum price
     */
    async getProductsInPriceRange(minPrice, maxPrice) {
        const allProducts = await this.getAllProducts();
        return allProducts.filter(product => 
            product.price >= minPrice && product.price <= maxPrice
        );
    }

    /**
     * Verify all displayed products match the expected criteria
     * @param {Object} criteria - Filter criteria to verify
     */
    async verifyProductsMatchCriteria(criteria = {}) {
        const products = await this.getAllProducts();
        const results = {
            total: products.length,
            matching: 0,
            mismatched: [],
            passed: true
        };

        for (const product of products) {
            let matches = true;
            const issues = [];

            // Check brand filter
            if (criteria.brands && criteria.brands.length > 0) {
                if (!criteria.brands.some(brand => 
                    brand.toLowerCase() === product.brand.toLowerCase()
                )) {
                    matches = false;
                    issues.push(`Brand ${product.brand} not in filter: ${criteria.brands.join(', ')}`);
                }
            }

            // Check price range
            if (criteria.minPrice !== undefined && product.price < criteria.minPrice) {
                matches = false;
                issues.push(`Price ${product.price} below minimum ${criteria.minPrice}`);
            }

            if (criteria.maxPrice !== undefined && product.price > criteria.maxPrice) {
                matches = false;
                issues.push(`Price ${product.price} above maximum ${criteria.maxPrice}`);
            }

            if (matches) {
                results.matching++;
            } else {
                results.mismatched.push({
                    product: product.title,
                    issues: issues
                });
                results.passed = false;
            }
        }

        return results;
    }

    /**
     * Add a product to cart by index
     * @param {number} index - Product index to add to cart
     */
    async addProductToCart(index) {
        const products = await this.productCards;
        if (index >= products.length) {
            throw new Error(`Product index ${index} out of range. Only ${products.length} products available.`);
        }

        const productCard = products[index];
        const addToCartBtn = await productCard.$('[data-testid="add-to-cart"], .add-to-cart, button');
        
        // Get initial cart count
        const initialCartCount = await this.getCartCount();
        
        // Click add to cart
        await this.safeClick(addToCartBtn);
        
        // Wait for cart count to update
        await browser.waitUntil(
            async () => {
                const newCartCount = await this.getCartCount();
                return newCartCount > initialCartCount;
            },
            {
                timeout: 5000,
                timeoutMsg: 'Cart count did not update after adding product'
            }
        );
    }

    /**
     * Get current cart count
     */
    async getCartCount() {
        try {
            const cartCountText = await this.getElementText(this.cartCounter);
            return parseInt(cartCountText) || 0;
        } catch (error) {
            return 0;
        }
    }

    /**
     * Check if "no results" message is displayed
     */
    async isNoResultsDisplayed() {
        return await this.isElementDisplayed(this.noResultsMessage);
    }

    /**
     * Verify page load performance
     */
    async verifyPageLoadPerformance() {
        const metrics = await this.capturePerformanceMetrics();
        return {
            domContentLoaded: metrics.domContentLoaded,
            loadComplete: metrics.loadComplete,
            firstPaint: metrics.firstPaint,
            firstContentfulPaint: metrics.firstContentfulPaint,
            performanceScore: this.calculatePerformanceScore(metrics)
        };
    }

    /**
     * Calculate performance score based on metrics
     * @param {Object} metrics - Performance metrics
     */
    calculatePerformanceScore(metrics) {
        let score = 100;
        
        // Deduct points for slow loading
        if (metrics.domContentLoaded > 2000) score -= 20;
        if (metrics.loadComplete > 3000) score -= 20;
        if (metrics.firstContentfulPaint > 1500) score -= 20;
        
        return Math.max(0, score);
    }

    /**
     * Scroll to bottom of page to trigger any lazy loading
     */
    async scrollToBottom() {
        await browser.execute(() => {
            window.scrollTo(0, document.body.scrollHeight);
        });
        await browser.pause(1000); // Wait for any lazy loading
    }

    /**
     * Refresh the page and wait for products to reload
     */
    async refreshPage() {
        await browser.refresh();
        await this.waitForProductsToLoad();
    }
}

module.exports = ProductListingPage; 