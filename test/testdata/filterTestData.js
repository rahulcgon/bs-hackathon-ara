const faker = require('faker');

/**
 * Test data for filter testing on testathon.live
 * Provides comprehensive test data for all filter scenarios
 */
class FilterTestData {

    /**
     * Get all available brands for testing
     */
    static getBrands() {
        return ['iPhone', 'Galaxy', 'Pixel', 'OnePlus'];
    }

    /**
     * Get brand combinations for multi-filter testing
     */
    static getBrandCombinations() {
        return [
            // Single brand selections
            ['iPhone'],
            ['Galaxy'],
            ['Pixel'],
            ['OnePlus'],

            // Two brand combinations
            ['iPhone', 'Galaxy'],
            ['iPhone', 'Pixel'],
            ['iPhone', 'OnePlus'],
            ['Galaxy', 'Pixel'],
            ['Galaxy', 'OnePlus'],
            ['Pixel', 'OnePlus'],

            // Three brand combinations
            ['iPhone', 'Galaxy', 'Pixel'],
            ['iPhone', 'Galaxy', 'OnePlus'],
            ['iPhone', 'Pixel', 'OnePlus'],
            ['Galaxy', 'Pixel', 'OnePlus'],

            // All brands
            ['iPhone', 'Galaxy', 'Pixel', 'OnePlus']
        ];
    }

    /**
     * Get price ranges for testing based on expected phone prices
     */
    static getPriceRanges() {
        return [
            // Budget range
            { min: 0, max: 500, description: 'Budget phones', expectedBrands: [] },

            // Mid-range
            { min: 400, max: 700, description: 'Mid-range phones', expectedBrands: ['iPhone', 'Galaxy', 'Pixel'] },

            // Premium range
            { min: 600, max: 900, description: 'Premium phones', expectedBrands: ['iPhone', 'Galaxy', 'Pixel', 'OnePlus'] },

            // High-end range
            { min: 800, max: 1200, description: 'High-end phones', expectedBrands: ['iPhone', 'Galaxy', 'Pixel', 'OnePlus'] },

            // Flagship range
            { min: 1000, max: 1500, description: 'Flagship phones', expectedBrands: ['iPhone', 'Galaxy'] },

            // Ultra-premium
            { min: 1300, max: 9999, description: 'Ultra-premium phones', expectedBrands: ['iPhone', 'Galaxy'] }
        ];
    }

    /**
     * Get boundary value test cases for price ranges
     */
    static getPriceBoundaryValues() {
        return [
            // Valid boundary values
            { min: 0, max: 1, description: 'Minimum valid range' },
            { min: 0.01, max: 0.02, description: 'Decimal precision test' },
            { min: 499, max: 500, description: 'Boundary around 500' },
            { min: 799, max: 800, description: 'Boundary around 800' },
            { min: 999, max: 1000, description: 'Boundary around 1000' },
            { min: 9998, max: 9999, description: 'Maximum valid range' },

            // Edge cases
            { min: 0, max: 0, description: 'Zero range' },
            { min: 500, max: 500, description: 'Single price point' },
            { min: 1000, max: 999, description: 'Invalid range (min > max)' }
        ];
    }

    /**
     * Get invalid input test cases
     */
    static getInvalidInputs() {
        return {
            prices: [
                { min: -100, max: 500, description: 'Negative minimum price' },
                { min: 0, max: -100, description: 'Negative maximum price' },
                { min: -100, max: -50, description: 'Both negative prices' },
                { min: 'abc', max: 500, description: 'Alphabetic minimum price' },
                { min: 500, max: 'xyz', description: 'Alphabetic maximum price' },
                { min: '!@#', max: '$%^', description: 'Special characters' },
                { min: 999999999, max: 999999999, description: 'Extremely large numbers' },
                { min: 0.001, max: 0.002, description: 'Too precise decimals' }
            ],
            brands: [
                'InvalidBrand',
                'NotExistingBrand',
                '12345',
                '!@#$%',
                '',
                null,
                undefined
            ]
        };
    }

    /**
     * Get sort type test cases
     */
    static getSortTypes() {
        return [
            { value: 'price_asc', description: 'Price: Low to High' },
            { value: 'price_desc', description: 'Price: High to Low' },
            { value: 'name_asc', description: 'Name: A to Z' },
            { value: 'name_desc', description: 'Name: Z to A' },
            { value: 'popularity', description: 'Popularity' },
            { value: 'rating', description: 'Customer Rating' },
            { value: 'newest', description: 'Newest First' }
        ];
    }

    /**
     * Get view type options
     */
    static getViewTypes() {
        return ['grid', 'list'];
    }

    /**
     * Get results per page options
     */
    static getResultsPerPageOptions() {
        return [12, 24, 36, 48, 60];
    }

    /**
     * Get complex filter scenarios combining multiple filter types
     */
    static getComplexFilterScenarios() {
        return [
            {
                name: 'iPhone Premium Range',
                brands: ['iPhone'],
                priceRange: { min: 800, max: 1200 },
                sortType: 'price_asc',
                viewType: 'grid',
                expectedResults: 'iPhone products between $800-$1200 sorted by price ascending'
            },
            {
                name: 'Budget Android Phones',
                brands: ['Galaxy', 'Pixel', 'OnePlus'],
                priceRange: { min: 400, max: 700 },
                sortType: 'price_desc',
                viewType: 'list',
                expectedResults: 'Android phones under $700 sorted by price descending'
            },
            {
                name: 'High-End Multi-Brand',
                brands: ['iPhone', 'Galaxy'],
                priceRange: { min: 1000, max: 1500 },
                sortType: 'name_asc',
                viewType: 'grid',
                expectedResults: 'Premium iPhone and Galaxy phones sorted alphabetically'
            },
            {
                name: 'All Brands Mid-Range',
                brands: ['iPhone', 'Galaxy', 'Pixel', 'OnePlus'],
                priceRange: { min: 600, max: 900 },
                sortType: 'price_asc',
                viewType: 'list',
                expectedResults: 'All brands in mid-range price sorted by price'
            }
        ];
    }

    /**
     * Get performance test scenarios
     */
    static getPerformanceTestScenarios() {
        return [
            {
                name: 'Rapid Filter Changes',
                actions: [
                    { type: 'selectBrand', value: 'iPhone' },
                    { type: 'wait', value: 100 },
                    { type: 'selectBrand', value: 'Galaxy' },
                    { type: 'wait', value: 100 },
                    { type: 'deselectBrand', value: 'iPhone' },
                    { type: 'wait', value: 100 },
                    { type: 'setPriceRange', value: { min: 500, max: 800 } },
                    { type: 'wait', value: 100 }
                ],
                expectedResponseTime: 2000
            },
            {
                name: 'Complex Filter Application',
                actions: [
                    { type: 'selectMultipleBrands', value: ['iPhone', 'Galaxy', 'Pixel'] },
                    { type: 'setPriceRange', value: { min: 700, max: 1200 } },
                    { type: 'applySortFilter', value: 'price_desc' },
                    { type: 'changeViewType', value: 'list' }
                ],
                expectedResponseTime: 3000
            }
        ];
    }

    /**
     * Get edge case test scenarios
     */
    static getEdgeCaseScenarios() {
        return [
            {
                name: 'No Results Scenario',
                brands: ['Pixel'],
                priceRange: { min: 2000, max: 3000 },
                expectedResult: 'noResults',
                description: 'Filter combination that yields no products'
            },
            {
                name: 'All Products Scenario',
                brands: ['iPhone', 'Galaxy', 'Pixel', 'OnePlus'],
                priceRange: { min: 0, max: 9999 },
                expectedResult: 'allProducts',
                description: 'Filter combination that shows all products'
            },
            {
                name: 'Single Product Range',
                brands: ['iPhone'],
                priceRange: { min: 1099, max: 1099 },
                expectedResult: 'singleProduct',
                description: 'Very specific filter that should show one product'
            }
        ];
    }

    /**
     * Get network condition test scenarios
     */
    static getNetworkConditions() {
        return [
            { name: 'fast3G', description: 'Fast 3G connection' },
            { name: 'slow3G', description: 'Slow 3G connection' },
            { name: 'offline', description: 'Offline condition' }
        ];
    }

    /**
     * Get accessibility test scenarios
     */
    static getAccessibilityTestScenarios() {
        return [
            {
                name: 'Keyboard Navigation',
                actions: [
                    { type: 'tabToFilter', filterType: 'brand' },
                    { type: 'activateWithKeyboard', key: 'Enter' },
                    { type: 'tabToFilter', filterType: 'price' },
                    { type: 'inputWithKeyboard', value: '500' }
                ]
            },
            {
                name: 'Screen Reader Testing',
                checks: [
                    'filterLabelsPresent',
                    'ariaLabelsCorrect',
                    'resultCountAnnounced',
                    'filterStateAnnounced'
                ]
            }
        ];
    }

    /**
     * Get random test data using Faker
     */
    static getRandomTestData() {
        return {
            brandCombination: faker.random.arrayElements(this.getBrands(), faker.random.number({ min: 1, max: 4 })),
            priceRange: {
                min: faker.random.number({ min: 0, max: 800 }),
                max: faker.random.number({ min: 800, max: 2000 })
            },
            sortType: faker.random.arrayElement(this.getSortTypes()).value,
            viewType: faker.random.arrayElement(this.getViewTypes()),
            resultsPerPage: faker.random.arrayElement(this.getResultsPerPageOptions())
        };
    }

    /**
     * Get expected product counts based on known data (approximate)
     */
    static getExpectedProductCounts() {
        return {
            total: 25,
            byBrand: {
                'iPhone': 8,   // iPhone 12, 12 Mini, 12 Pro, 12 Pro Max, 11, 11 Pro, XS, XR, XS Max
                'Galaxy': 8,   // Galaxy S20, S20+, S20 Ultra, S10, S9, Note 20, Note 20 Ultra
                'Pixel': 3,    // Pixel 4, Pixel 3, Pixel 2
                'OnePlus': 6   // OnePlus 8, 8T, 8 Pro, 7T, 7, 6T
            },
            byPriceRange: {
                'under500': 3,     // iPhone XR, Pixel 2, OnePlus 7
                '500to800': 8,     // iPhone 11, Galaxy S9, Pixel 3, Pixel 4, OnePlus series
                '800to1200': 10,   // iPhone 12 series, Galaxy S20 series, etc.
                'over1200': 4      // iPhone 12 Pro Max, Galaxy S20 Ultra, Galaxy Note 20 Ultra
            }
        };
    }

    /**
     * Get validation rules for filters
     */
    static getValidationRules() {
        return {
            price: {
                min: 0,
                max: 9999,
                decimalPlaces: 2,
                required: false
            },
            brands: {
                allowedValues: this.getBrands(),
                multiSelect: true,
                required: false
            },
            sort: {
                allowedValues: this.getSortTypes().map(s => s.value),
                required: false,
                default: 'default'
            }
        };
    }

    /**
     * Get test execution configuration
     */
    static getTestConfig() {
        return {
            timeout: {
                pageLoad: 10000,
                filterApplication: 5000,
                elementWait: 5000
            },
            retry: {
                attempts: 3,
                delay: 1000
            },
            performance: {
                maxResponseTime: 2000,
                maxPageLoadTime: 3000
            },
            screenshots: {
                onFailure: true,
                onSuccess: false,
                path: './screenshots/'
            }
        };
    }
}

module.exports = FilterTestData;