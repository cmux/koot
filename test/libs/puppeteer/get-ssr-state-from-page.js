/**
 * 从 page 中获取 SSR state
 * @async
 * @param {*} page
 * @returns {Promise<Object>}
 */
const getSsrStateFromPage = async (page) =>
    await page.evaluate(() => window.__REDUX_STATE__);

export default getSsrStateFromPage;
