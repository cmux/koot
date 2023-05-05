/**
 * 从 page 中获取当前语种ID
 * @async
 * @param {*} page
 * @returns {Promise<string>}
 */
const getLocaleIdFromPage = async (page) =>
    await page.evaluate(() =>
        document
            .querySelector('meta[name="koot-locale-id"]')
            .getAttribute('content')
    );

export default getLocaleIdFromPage;
