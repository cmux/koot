import vars from './vars.js';
import getLocales from './get-locales.js';

/**
 * @async
 * 确保语言包已就绪
 * @returns {Promise<void>}
 */
async function ensureLocales() {
    vars.locales = await getLocales();
}

export default ensureLocales;
