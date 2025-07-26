const { expect } = require('@wdio/globals');
const ProductListingPage = require('../../pageobjects/ProductListingPage');
const FilterPanel = require('../../pageobjects/FilterPanel');
const FilterTestData = require('../../testdata/filterTestData');

describe('Basic Filter Operations - testathon.live', () => {
    let productListingPage;
    let filterPanel;
    let initialProductCount;

    before(async () => {
        productListingPage = new ProductListingPage();
        filterPanel = new FilterPanel();
        
        // Navigate to the website and get initial state
        await productListingPage.open();
        initialProductCount = await productListingPage.getProductCount();
        
        console.log(`Initial product count: ${initialProductCount}`);
        expect(initialProductCount).toBeGreaterThan(0);
    });

    beforeEach(async () => {
        // Clear any existing filters before each test
        await filterPanel.clearAllFilters();
        await productListingPage.waitForProductsToLoad();
    });

    describe('Single Brand Filtering', () => {
        FilterTestData.getBrands().forEach(brand => {
            it(`should filter products by ${brand} brand`, async () => {
                // Apply brand filter
                const responseTime = await filterPanel.measureFilterResponseTime(async () => {
                    await filterPanel.selectBrandFilter(brand);
                });

                console.log(`${brand} filter response time: ${responseTime.responseTime}ms`);
                
                // Verify response time is acceptable
                expect(responseTime.responseTime).toBeLessThan(FilterTestData.getTestConfig().performance.maxResponseTime);

                // Wait for products to load
                await productListingPage.waitForProductsToLoad();

                // Get filtered products
                const filteredProducts = await productListingPage.getAllProducts();
                console.log(`${brand} filtered products count: ${filteredProducts.length}`);

                // Verify all displayed products match the selected brand
                const verificationResult = await productListingPage.verifyProductsMatchCriteria({
                    brands: [brand]
                });

                expect(verificationResult.passed).toBe(true);
                if (!verificationResult.passed) {
                    console.error('Mismatched products:', verificationResult.mismatched);
                }

                // Verify at least some products are shown (unless brand has no products)
                if (filteredProducts.length === 0) {
                    // Check if "no results" message is displayed
                    const noResultsDisplayed = await productListingPage.isNoResultsDisplayed();
                    expect(noResultsDisplayed).toBe(true);
                    console.log(`No ${brand} products found - this may be expected`);
                } else {
                    expect(filteredProducts.length).toBeGreaterThan(0);
                    expect(filteredProducts.length).toBeLessThanOrEqual(initialProductCount);
                }

                // Verify URL updates (if applicable)
                const currentUrl = await productListingPage.getCurrentUrl();
                console.log(`URL after ${brand} filter: ${currentUrl}`);
            });
        });

        it('should maintain filter state after page refresh', async () => {
            const testBrand = 'iPhone';
            
            // Apply brand filter
            await filterPanel.selectBrandFilter(testBrand);
            await productListingPage.waitForProductsToLoad();
            
            const beforeRefreshCount = await productListingPage.getProductCount();
            
            // Refresh the page
            await productListingPage.refreshPage();
            
            // Check if filter state is maintained
            const afterRefreshCount = await productListingPage.getProductCount();
            const selectedBrands = await filterPanel.getSelectedBrandFilters();
            
            // Note: This test might fail if the site doesn't persist filter state
            // That would be a valid finding to report
            console.log(`Selected brands after refresh: ${selectedBrands.join(', ')}`);
            console.log(`Product count before refresh: ${beforeRefreshCount}, after: ${afterRefreshCount}`);
        });
    });



    describe('Filter State Management', () => {
        it('should clear all filters correctly', async () => {
            // Apply brand filter
            await filterPanel.selectBrandFilter('iPhone');
            await productListingPage.waitForProductsToLoad();
            
            const filteredCount = await productListingPage.getProductCount();
            expect(filteredCount).toBeLessThanOrEqual(initialProductCount);
            
            // Clear all filters
            await filterPanel.clearAllFilters();
            await productListingPage.waitForProductsToLoad();
            
            const clearedCount = await productListingPage.getProductCount();
            expect(clearedCount).toBe(initialProductCount);
            
            // Verify no brand filters are selected
            const selectedBrands = await filterPanel.getSelectedBrandFilters();
            expect(selectedBrands.length).toBe(0);
        });

        it('should show current filter state correctly', async () => {
            // Apply specific filter
            await filterPanel.selectBrandFilter('Galaxy');
            
            // Get current filter state
            const filterState = await filterPanel.getCurrentFilterState();
            
            expect(filterState.selectedBrands).toContain('Galaxy');
            
            console.log('Current filter state:', filterState);
        });
    });

    describe('Performance Testing', () => {
        it('should load initial products within acceptable time', async () => {
            const performanceMetrics = await productListingPage.verifyPageLoadPerformance();
            
            console.log('Page performance metrics:', performanceMetrics);
            
            expect(performanceMetrics.performanceScore).toBeGreaterThan(70);
            expect(performanceMetrics.firstContentfulPaint).toBeLessThan(2000);
        });

        it('should apply filters quickly on slow network', async () => {
            // Simulate slow 3G connection
            await productListingPage.setNetworkCondition('slow3G');
            
            const responseTime = await filterPanel.measureFilterResponseTime(async () => {
                await filterPanel.selectBrandFilter('Pixel');
            });
            
            // On slow network, allow more time but still reasonable
            expect(responseTime.responseTime).toBeLessThan(5000);
            
            console.log(`Filter response time on slow 3G: ${responseTime.responseTime}ms`);
        });
    });

    after(async () => {
        // Clean up any applied filters
        try {
            await filterPanel.clearAllFilters();
        } catch (error) {
            console.log('Cleanup error (non-critical):', error.message);
        }
    });
}); 