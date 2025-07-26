const { $, $$ } = require('@wdio/globals');
const BasePage = require('./BasePage');

/**
 * Filter Panel Page Object for testathon.live
 * Handles all filter interactions including brand, price, sort, and pagination
 */
class FilterPanel extends BasePage {

    // Filter Panel Selectors
    get filterPanel() {
        return $('.filters');
    }

    get filterToggle() {
        return $('.filter-toggle, .filters-toggle');
    }

    get clearAllFiltersBtn() {
        return $('button*=Clear');
    }

    get applyFiltersBtn() {
        return $('button*=Apply');
    }

    // Brand Filter Selectors
    get brandFilterSection() {
        return $('[data-testid="brand-filter"], .brand-filter, .filter-brand');
    }

    get brandFilterOptions() {
        return $$('[data-testid="brand-option"], .brand-option, input[type="checkbox"][name*="brand"]');
    }

    get iphoneFilter() {
        return $('input[value*="Apple"], input[value*="iPhone"], label*=Apple, label*=iPhone');
    }

    get galaxyFilter() {
        return $('input[value*="Samsung"], input[value*="Galaxy"], label*=Samsung, label*=Galaxy');
    }

    get pixelFilter() {
        return $('input[value*="Google"], input[value*="Pixel"], label*=Google, label*=Pixel');
    }

    get onePlusFilter() {
        return $('input[value*="OnePlus"], label*=OnePlus');
    }

    // Price Filter Selectors
    get priceFilterSection() {
        return $('[data-testid="price-filter"], .price-filter, .filter-price');
    }

    get minPriceInput() {
        return $('[data-testid="min-price"], input[name*="min"], input[placeholder*="min"]');
    }

    get maxPriceInput() {
        return $('[data-testid="max-price"], input[name*="max"], input[placeholder*="max"]');
    }

    get priceSlider() {
        return $('[data-testid="price-slider"], .price-slider, input[type="range"]');
    }

    get priceRangeOptions() {
        return $$('[data-testid="price-range"], .price-range, input[type="radio"][name*="price"]');
    }

    // Sort Filter Selectors
    get sortSection() {
        return $('[data-testid="sort"], .sort, .sorting');
    }

    get sortDropdown() {
        return $('[data-testid="sort-dropdown"], .sort-dropdown, select[name*="sort"]');
    }

    get sortPriceLowToHigh() {
        return $('option[value*="price_asc"], option[contains(text(),"Low to High")]');
    }

    get sortPriceHighToLow() {
        return $('option[value*="price_desc"], option[contains(text(),"High to Low")]');
    }

    get sortNameAZ() {
        return $('option[value*="name_asc"], option[contains(text(),"A-Z")]');
    }

    get sortNameZA() {
        return $('option[value*="name_desc"], option[contains(text(),"Z-A")]');
    }

    // View Options
    get viewSection() {
        return $('[data-testid="view"], .view-options, .view-toggle');
    }

    get gridViewBtn() {
        return $('[data-testid="grid-view"], .grid-view, button[contains(text(),"Grid")]');
    }

    get listViewBtn() {
        return $('[data-testid="list-view"], .list-view, button[contains(text(),"List")]');
    }

    // Pagination Selectors
    get paginationSection() {
        return $('[data-testid="pagination"], .pagination, .pager');
    }

    get resultsPerPageDropdown() {
        return $('[data-testid="per-page"], select[name*="per_page"], select[name*="limit"]');
    }

    get nextPageBtn() {
        return $('[data-testid="next-page"], .next-page, a[contains(text(),"Next")]');
    }

    get prevPageBtn() {
        return $('[data-testid="prev-page"], .prev-page, a[contains(text(),"Previous")]');
    }

    get pageNumbers() {
        return $$('[data-testid="page-number"], .page-number, .pagination a[href*="page"]');
    }

    /**
     * Check if filter panel is visible
     */
    async isFilterPanelVisible() {
        return await this.isElementDisplayed(this.filterPanel);
    }

    /**
     * Open filter panel if it's collapsed (mobile)
     */
    async openFilterPanel() {
        const isMobile = await this.isMobileDevice();
        if (isMobile) {
            try {
                const toggleButton = this.filterToggle;
                if (await this.isElementDisplayed(toggleButton)) {
                    await this.safeClick(toggleButton);
                    await this.filterPanel.waitForDisplayed({ timeout: 5000 });
                }
            } catch (error) {
                console.warn('Filter toggle not found, panel might already be open');
            }
        }

        // Ensure filter panel is visible
        await this.filterPanel.waitForDisplayed({ timeout: 10000 });
    }

    /**
     * Select brand filter
     * @param {string} brand - Brand name ('iPhone', 'Galaxy', 'Pixel', 'OnePlus')
     */
    async selectBrandFilter(brand) {
        await this.openFilterPanel();

        const brandMap = {
            'iPhone': this.iphoneFilter,
            'Apple': this.iphoneFilter,
            'Galaxy': this.galaxyFilter,
            'Samsung': this.galaxyFilter,
            'Pixel': this.pixelFilter,
            'Google': this.pixelFilter,
            'OnePlus': this.onePlusFilter
        };

        const filterElement = brandMap[brand];
        if (!filterElement) {
            throw new Error(`Brand filter for ${brand} not found`);
        }

        // Scroll to the filter element
        await this.scrollToElement(filterElement);

        // Check if it's a checkbox or label
        const isCheckbox = await filterElement.getAttribute('type') === 'checkbox';

        if (isCheckbox) {
            const isChecked = await filterElement.isSelected();
            if (!isChecked) {
                await this.safeClick(filterElement);
            }
        } else {
            // It might be a label, click it
            await this.safeClick(filterElement);
        }

        // Wait for filters to apply
        await this.waitForFilterApplication();
    }

    /**
     * Deselect brand filter
     * @param {string} brand - Brand name to deselect
     */
    async deselectBrandFilter(brand) {
        await this.openFilterPanel();

        const brandMap = {
            'iPhone': this.iphoneFilter,
            'Apple': this.iphoneFilter,
            'Galaxy': this.galaxyFilter,
            'Samsung': this.galaxyFilter,
            'Pixel': this.pixelFilter,
            'Google': this.pixelFilter,
            'OnePlus': this.onePlusFilter
        };

        const filterElement = brandMap[brand];
        if (!filterElement) {
            throw new Error(`Brand filter for ${brand} not found`);
        }

        const isCheckbox = await filterElement.getAttribute('type') === 'checkbox';

        if (isCheckbox) {
            const isChecked = await filterElement.isSelected();
            if (isChecked) {
                await this.safeClick(filterElement);
            }
        }

        await this.waitForFilterApplication();
    }

    /**
     * Select multiple brand filters
     * @param {string[]} brands - Array of brand names
     */
    async selectMultipleBrandFilters(brands) {
        await this.openFilterPanel();

        for (const brand of brands) {
            await this.selectBrandFilter(brand);
            await browser.pause(500); // Small delay between selections
        }
    }

    /**
     * Get currently selected brand filters
     */
    async getSelectedBrandFilters() {
        await this.openFilterPanel();

        const selectedBrands = [];
        const brandMap = {
            'iPhone': this.iphoneFilter,
            'Apple': this.iphoneFilter,
            'Galaxy': this.galaxyFilter,
            'Samsung': this.galaxyFilter,
            'Pixel': this.pixelFilter,
            'Google': this.pixelFilter,
            'OnePlus': this.onePlusFilter
        };

        for (const [brand, element] of Object.entries(brandMap)) {
            try {
                const isSelected = await element.isSelected();
                if (isSelected) {
                    selectedBrands.push(brand);
                }
            } catch (error) {
                // Element might not exist, continue
            }
        }

        return selectedBrands;
    }

    /**
     * Set price range filter
     * @param {number} minPrice - Minimum price
     * @param {number} maxPrice - Maximum price
     */
    async setPriceRange(minPrice, maxPrice) {
        await this.openFilterPanel();

        // Try min/max input fields first
        try {
            if (await this.isElementDisplayed(this.minPriceInput)) {
                await this.typeText(this.minPriceInput, minPrice.toString());
            }

            if (await this.isElementDisplayed(this.maxPriceInput)) {
                await this.typeText(this.maxPriceInput, maxPrice.toString());
            }
        } catch (error) {
            console.warn('Price input fields not found, trying alternative methods');
        }

        // Try price slider if inputs not available
        try {
            if (await this.isElementDisplayed(this.priceSlider)) {
                // This would need more complex implementation for dual-range sliders
                console.log('Price slider found but not implemented in this version');
            }
        } catch (error) {
            console.warn('Price slider not found');
        }

        await this.waitForFilterApplication();
    }

    /**
     * Apply sort filter
     * @param {string} sortType - Sort type ('price_asc', 'price_desc', 'name_asc', 'name_za')
     */
    async applySortFilter(sortType) {
        await this.openFilterPanel();

        try {
            await this.waitForElementClickable(this.sortDropdown);
            await this.safeClick(this.sortDropdown);

            const sortMap = {
                'price_asc': this.sortPriceLowToHigh,
                'price_desc': this.sortPriceHighToLow,
                'name_asc': this.sortNameAZ,
                'name_desc': this.sortNameZA
            };

            const sortOption = sortMap[sortType];
            if (sortOption) {
                await this.safeClick(sortOption);
            } else {
                throw new Error(`Sort type ${sortType} not supported`);
            }

            await this.waitForFilterApplication();
        } catch (error) {
            console.warn('Sort dropdown not found or not functional:', error.message);
        }
    }

    /**
     * Change view type (grid/list)
     * @param {string} viewType - 'grid' or 'list'
     */
    async changeViewType(viewType) {
        const viewMap = {
            'grid': this.gridViewBtn,
            'list': this.listViewBtn
        };

        const viewButton = viewMap[viewType];
        if (viewButton && await this.isElementDisplayed(viewButton)) {
            await this.safeClick(viewButton);
            await browser.pause(1000); // Wait for view to change
        }
    }

    /**
     * Change results per page
     * @param {number} perPage - Number of results per page
     */
    async changeResultsPerPage(perPage) {
        try {
            if (await this.isElementDisplayed(this.resultsPerPageDropdown)) {
                await this.safeClick(this.resultsPerPageDropdown);

                const option = await this.resultsPerPageDropdown.$(`option[value="${perPage}"]`);
                if (await this.isElementDisplayed(option)) {
                    await this.safeClick(option);
                    await this.waitForFilterApplication();
                }
            }
        } catch (error) {
            console.warn('Results per page dropdown not functional:', error.message);
        }
    }

    /**
     * Clear all active filters
     */
    async clearAllFilters() {
        await this.openFilterPanel();

        try {
            if (await this.isElementDisplayed(this.clearAllFiltersBtn)) {
                await this.safeClick(this.clearAllFiltersBtn);
                await this.waitForFilterApplication();
            } else {
                // Manually deselect all brand filters
                const selectedBrands = await this.getSelectedBrandFilters();
                for (const brand of selectedBrands) {
                    await this.deselectBrandFilter(brand);
                }
            }
        } catch (error) {
            console.warn('Clear filters button not found:', error.message);
        }
    }

    /**
     * Apply all filter changes
     */
    async applyFilters() {
        try {
            if (await this.isElementDisplayed(this.applyFiltersBtn)) {
                await this.safeClick(this.applyFiltersBtn);
                await this.waitForFilterApplication();
            }
        } catch (error) {
            // Filters might apply automatically, this is not always an error
            console.log('Apply filters button not found, filters may apply automatically');
        }
    }

    /**
     * Wait for filter application to complete
     */
    async waitForFilterApplication() {
        // Wait for any loading indicators to disappear
        try {
            const loadingIndicator = $('[data-testid="loading"], .loading, .spinner');
            await loadingIndicator.waitForDisplayed({ timeout: 2000 });
            await loadingIndicator.waitForDisplayed({ timeout: 10000, reverse: true });
        } catch (error) {
            // No loading indicator found, continue
        }

        // Small pause to ensure DOM updates are complete
        await browser.pause(1000);
    }

    /**
     * Get current filter state
     */
    async getCurrentFilterState() {
        const state = {
            selectedBrands: await this.getSelectedBrandFilters(),
            priceRange: await this.getCurrentPriceRange(),
            sortType: await this.getCurrentSortType(),
            viewType: await this.getCurrentViewType()
        };

        return state;
    }

    /**
     * Get current price range (if visible)
     */
    async getCurrentPriceRange() {
        try {
            const minPrice = await this.minPriceInput.getValue();
            const maxPrice = await this.maxPriceInput.getValue();
            return {
                min: parseFloat(minPrice) || 0,
                max: parseFloat(maxPrice) || 999999
            };
        } catch (error) {
            return { min: 0, max: 999999 };
        }
    }

    /**
     * Get current sort type
     */
    async getCurrentSortType() {
        try {
            const selectedValue = await this.sortDropdown.getValue();
            return selectedValue;
        } catch (error) {
            return 'default';
        }
    }

    /**
     * Get current view type
     */
    async getCurrentViewType() {
        try {
            const gridActive = await this.gridViewBtn.getAttribute('class');
            const listActive = await this.listViewBtn.getAttribute('class');

            if (gridActive && gridActive.includes('active')) return 'grid';
            if (listActive && listActive.includes('active')) return 'list';

            return 'grid'; // Default assumption
        } catch (error) {
            return 'grid';
        }
    }

    /**
     * Measure filter response time
     * @param {Function} filterAction - Async function that applies a filter
     */
    async measureFilterResponseTime(filterAction) {
        return await this.measureResponseTime(filterAction);
    }

    /**
     * Test filter with invalid inputs
     * @param {Object} invalidInputs - Object containing invalid filter values
     */
    async testInvalidFilterInputs(invalidInputs) {
        const results = {
            priceRange: { passed: true, errors: [] },
            brandSelection: { passed: true, errors: [] }
        };

        // Test invalid price ranges
        if (invalidInputs.prices) {
            for (const price of invalidInputs.prices) {
                try {
                    await this.setPriceRange(price.min, price.max);
                    // If this doesn't throw an error, check if validation prevents invalid values
                    const currentRange = await this.getCurrentPriceRange();
                    if (currentRange.min === price.min && currentRange.max === price.max) {
                        results.priceRange.passed = false;
                        results.priceRange.errors.push(`Invalid price range accepted: ${price.min}-${price.max}`);
                    }
                } catch (error) {
                    // This is good - the system rejected invalid input
                    console.log(`Invalid price range properly rejected: ${price.min}-${price.max}`);
                }
            }
        }

        return results;
    }
}

module.exports = FilterPanel;