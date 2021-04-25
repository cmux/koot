const vars = require('./vars');
const getLocales = require('./get-locales');

/**
 * @async
 * 确保语言包已就绪
 * @returns {Promise<void>}
 */
async function ensureLocales() {
    vars.locales = await getLocales();
}

module.exports = ensureLocales;
