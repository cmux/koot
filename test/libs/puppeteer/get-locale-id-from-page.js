/**
 * 从 page 中获取当前语种ID
 * @async
 * @param {*} page
 * @returns {Promise<string>}
 */
module.exports = async (page) =>
    await page.evaluate(() =>
        document
            .querySelector('meta[name="koot-locale-id"]')
            .getAttribute('content')
    );
