import { getLocaleId } from '../libs/ssr/context';
import locales from './locales';

/**
 * 检查目标语言包ID的语言包内容是否已初始化
 *
 * @param {*string} theLocaleId 目标语言包ID
 *
 * @returns {boolean}
 */
export const checkLocalesReady = (theLocaleId = getLocaleId()) => {
    return typeof locales[theLocaleId] !== 'undefined';
};

// export default translate
