const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: false
    });
    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();
    await page.goto('http://localhost:3081', {
        waitUntil: 'networkidle0'
    });
    const count = await page.evaluate(() => window.__REDUX_STOER_RUN_COUNT__);
    console.log({ count });
})();
