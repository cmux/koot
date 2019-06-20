import get from 'lodash/get';

import { localeId } from '../';
import locales from './locales';

export let l = (() => {
    if (__SERVER__) {
        if (__DEV__ && typeof global.__KOOT_SSR__ === 'object') {
            if (typeof global.__KOOT_SSR__.locales === 'object')
                return global.__KOOT_SSR__.locales[localeId];
            return {};
        }
        // console.log({ locales })
        if (typeof locales === 'object') return locales[localeId];
        return {};
    }
    if (JSON.parse(process.env.KOOT_I18N_TYPE) === 'redux') return locales;
    return false;
})();

/**
 * 翻译文本
 * 语言包中源文本中的 ${replaceKey} 表示此处需要替换，replaceKey 就是传入的 obj 中对应的值
 *
 * @param {string} key 要翻译的文本 Key
 * @param {*object} obj 文本内对应的替换内容
 *
 * @returns {string} 翻译的文本；如果语言包中没有对应的项，返回 key
 */
const translate = (...args) => {
    let key = '';
    let str;
    let options = {};
    const keys = [];

    if (__SERVER__ && __DEV__) l = locales[global.__KOOT_LOCALEID__];

    args.forEach((value, index) => {
        // 如果最后一个参数是 Object，表示为选项
        if (
            index === args.length - 1 &&
            typeof value === 'object' &&
            !Array.isArray(value)
        ) {
            options = value;
            return;
        }
        if (typeof value === 'string' && value.includes('.')) {
            value.split('.').forEach(value => keys.push(value));
            return;
        }
        keys.push(value);
    });

    const length = keys.length;

    if (typeof keys[0] === 'object') {
        // 第一个值为 Object，通常是客户端情况
        // 后续值依次取前一个 Object 内对应的值
        key = keys[0];
        let hasUnmatched = false;
        for (let i = 1; i < length; i++) {
            // const value = get(key, keys[i]);
            const value = key[keys[i]];
            // console.log(key, value);
            if (typeof value === 'undefined') {
                hasUnmatched = true;
                break;
            } else {
                key = value;
            }
            // if (typeof key[keys[i]] !== 'undefined') key = key[keys[i]];
        }
        if (hasUnmatched) key = keys[length - 1];
    } else if (length === 1) {
        key = keys[0];
    } else {
        for (let i = 0; i < length; i++) {
            if (typeof l === 'object') {
                if (keys[i] !== '') key += `[${JSON.stringify(keys[i])}]`;
            } else {
                key += (i ? '.' : '') + keys[i];
            }
        }
    }

    // console.log(key);
    // if (__CLIENT__) {
    //     // console.log(localeId)
    //     console.log(localeId, keys, length, key, l);
    // }

    if (typeof l === 'undefined') {
        str = key;
    } else if (typeof l === 'object') {
        // str = l && typeof l[key] !== 'undefined' ? l[key] : undefined;
        str = get(l, key);
    }
    // const localeId = _self.curLocaleId

    // if (typeof str === 'undefined' && typeof l === 'object') {
    //     try {
    //         str = get(l, key);
    //         // str = eval('l.' + key);
    //     } catch (e) {}
    // }

    if (typeof str === 'undefined') str = key;

    if (typeof str === 'string')
        return str.replace(/\$\{([^}]+)\}/g, (match, p) =>
            typeof options[p] === 'undefined' ? p : options[p]
        );

    return str;
};
export default translate;
