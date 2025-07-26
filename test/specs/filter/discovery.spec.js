const { expect, browser, $ } = require('@wdio/globals');

describe('DOM Discovery - testathon.live', () => {
    
    before(async () => {
        await browser.url('https://testathon.live');
        await browser.pause(3000); // Wait for page to load
    });

    it('should discover the page structure and elements', async () => {
        // Get page title and URL
        const title = await browser.getTitle();
        const url = await browser.getUrl();
        console.log(`Page Title: ${title}`);
        console.log(`Page URL: ${url}`);

        // Take a screenshot for analysis
        await browser.saveScreenshot('./screenshots/page-discovery.png');

        // Get page source to analyze structure
        const pageSource = await browser.getPageSource();
        console.log(`Page source length: ${pageSource.length}`);

        // Discover main containers
        const bodyContent = await browser.execute(() => {
            return document.body.innerHTML.length;
        });
        console.log(`Body content length: ${bodyContent}`);

        // Try to find any elements with common product-related classes/ids
        const commonSelectors = [
            'main',
            '.main',
            '#main',
            '.container',
            '.content',
            '.products',
            '.product-list',
            '.product-grid',
            '.items',
            '[class*="product"]',
            '[class*="item"]',
            '[class*="card"]',
            'article',
            '.row',
            '.grid'
        ];

        console.log('\n=== DISCOVERING MAIN CONTAINERS ===');
        for (const selector of commonSelectors) {
            try {
                const elements = await browser.$$(selector);
                if (elements.length > 0) {
                    console.log(`✅ Found ${elements.length} elements with selector: ${selector}`);
                    
                    // Get more details about the first element
                    const firstElement = elements[0];
                    const tagName = await firstElement.getTagName();
                    const className = await firstElement.getAttribute('class');
                    const id = await firstElement.getAttribute('id');
                    
                    console.log(`   - Tag: ${tagName}, Class: ${className || 'none'}, ID: ${id || 'none'}`);
                }
            } catch (error) {
                // Selector not valid or element not found
            }
        }

        // Discover filter-related elements
        const filterSelectors = [
            '.filter',
            '.filters',
            '.sidebar',
            '.filter-panel',
            '[class*="filter"]',
            'form',
            'input[type="checkbox"]',
            'input[type="radio"]',
            'select',
            'button',
            '[class*="brand"]',
            '[class*="price"]',
            '[class*="sort"]'
        ];

        console.log('\n=== DISCOVERING FILTER ELEMENTS ===');
        for (const selector of filterSelectors) {
            try {
                const elements = await browser.$$(selector);
                if (elements.length > 0) {
                    console.log(`✅ Found ${elements.length} elements with selector: ${selector}`);
                    
                    // Get details about first few elements
                    for (let i = 0; i < Math.min(3, elements.length); i++) {
                        const element = elements[i];
                        const tagName = await element.getTagName();
                        const text = await element.getText();
                        const type = await element.getAttribute('type');
                        const name = await element.getAttribute('name');
                        const value = await element.getAttribute('value');
                        
                        console.log(`   [${i}] Tag: ${tagName}, Text: "${text.substring(0, 50)}", Type: ${type || 'none'}, Name: ${name || 'none'}, Value: ${value || 'none'}`);
                    }
                }
            } catch (error) {
                // Selector not valid or element not found
            }
        }

        // Discover product-like elements by looking for images, prices, and text
        console.log('\n=== DISCOVERING PRODUCT ELEMENTS ===');
        
        // Look for price patterns
        const priceElements = await browser.$$('*');
        let productElements = [];
        
        for (let i = 0; i < Math.min(50, priceElements.length); i++) {
            try {
                const element = priceElements[i];
                const text = await element.getText();
                
                // Check if text contains price patterns
                if (text && (text.includes('$') || text.match(/\d+\.\d{2}/))) {
                    const tagName = await element.getTagName();
                    const className = await element.getAttribute('class');
                    const parentClassName = await element.getParent().getAttribute('class');
                    
                    console.log(`💰 Price element: ${tagName}.${className || 'none'} - "${text.substring(0, 30)}" (Parent: ${parentClassName || 'none'})`);
                    
                    if (text.includes('$') && text.length < 20) {
                        productElements.push({
                            element: element,
                            price: text,
                            className: className,
                            parentClassName: parentClassName
                        });
                    }
                }
            } catch (error) {
                // Skip this element
            }
        }

        // Look for images that might be products
        const images = await browser.$$('img');
        console.log(`\n📸 Found ${images.length} images on the page`);
        
        for (let i = 0; i < Math.min(10, images.length); i++) {
            try {
                const img = images[i];
                const src = await img.getAttribute('src');
                const alt = await img.getAttribute('alt');
                const className = await img.getAttribute('class');
                const parentClassName = await img.getParent().getAttribute('class');
                
                console.log(`   [${i}] Src: ${src ? src.substring(0, 50) : 'none'}, Alt: "${alt || 'none'}", Class: ${className || 'none'}, Parent: ${parentClassName || 'none'}`);
            } catch (error) {
                // Skip this image
            }
        }

        // Get all text content and look for brand names
        console.log('\n=== DISCOVERING BRAND NAMES ===');
        const bodyText = await browser.execute(() => {
            return document.body.innerText;
        });
        
        const brands = ['iPhone', 'Galaxy', 'Pixel', 'OnePlus', 'Samsung'];
        const brandCounts = {};
        
        brands.forEach(brand => {
            const regex = new RegExp(brand, 'gi');
            const matches = bodyText.match(regex);
            brandCounts[brand] = matches ? matches.length : 0;
            console.log(`📱 "${brand}" appears ${brandCounts[brand]} times`);
        });

        // Try to find specific elements by common e-commerce patterns
        console.log('\n=== ANALYZING PAGE STRUCTURE ===');
        
        const structureAnalysis = await browser.execute(() => {
            // Count different types of elements
            const analysis = {
                divs: document.querySelectorAll('div').length,
                spans: document.querySelectorAll('span').length,
                buttons: document.querySelectorAll('button').length,
                inputs: document.querySelectorAll('input').length,
                images: document.querySelectorAll('img').length,
                links: document.querySelectorAll('a').length,
                forms: document.querySelectorAll('form').length,
                articles: document.querySelectorAll('article').length,
                sections: document.querySelectorAll('section').length
            };
            
            // Get all classes used on the page
            const allElements = document.querySelectorAll('*');
            const classNames = new Set();
            
            allElements.forEach(el => {
                if (el.className && typeof el.className === 'string') {
                    el.className.split(' ').forEach(cls => {
                        if (cls.trim()) classNames.add(cls.trim());
                    });
                }
            });
            
            analysis.uniqueClasses = Array.from(classNames).slice(0, 50); // First 50 classes
            
            return analysis;
        });
        
        console.log(`📊 Page structure:`, structureAnalysis);
        
        console.log('\n🔍 Unique CSS classes found (first 50):');
        structureAnalysis.uniqueClasses.forEach((className, index) => {
            console.log(`   ${index + 1}. ${className}`);
        });

        // This test should always pass - it's just for discovery
        expect(title).toBeDefined();
    });

    it('should check if the page is loading correctly', async () => {
        // Check if page is fully loaded
        const readyState = await browser.execute(() => {
            return document.readyState;
        });
        
        console.log(`Document ready state: ${readyState}`);
        expect(readyState).toBe('complete');
    });
}); 