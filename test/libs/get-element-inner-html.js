const cheerio = require('cheerio');

/**
 * 获取目标元素的 innerHTML，同时支持 SSR 和 CSR
 * @async
 * @param {Response} res
 * @param {Page} page
 * @param {string} selector
 * @returns {Promise<{ssr: string, csr: string}>}
 */
const getElementInnerHTML = async (res, page, selector) => {
    const result = {
        ssr: undefined,
        csr: undefined
    };

    const HTML = await res.text();
    const $ = cheerio.load(HTML);

    const SSR = $(selector);
    if (SSR) {
        result.ssr = SSR.html();
    }

    const CSR = await page.$(selector);
    if (CSR) {
        result.csr = await page.$eval(selector, e => e.innerHTML);
    }

    return result;
};

module.exports = getElementInnerHTML;
