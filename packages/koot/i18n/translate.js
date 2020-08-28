import get from 'lodash/get';

import { get as getSSRContext, resetLocaleId } from '../libs/ssr/context';
import locales, { setLocales, getLocalesObject } from './locales';

export let l = undefined;
const resetL = () => {
    if (__SERVER__) {
        const { locales = {}, LocaleId } = getSSRContext();
        l = locales[LocaleId] || {};
    } else if (JSON.parse(process.env.KOOT_I18N_TYPE) === 'store') l = locales;
    else l = false;

    setLocales(l);
};
resetL();

let isSPACorrected = false;
let isSSRCorrected = false;

const doCorrect = () => {
    if (__SERVER__ && __DEV__) {
        l = locales[global.__KOOT_LOCALEID__];
        return;
    }

    // if (isSSRCorrected) {
    //     console.log('correct', {
    //         isSSRCorrected,
    //         l,
    //     });
    // } else {
    //     console.log('correct', {
    //         isSSRCorrected,
    //         l,
    //         SSR: getSSRContext(),
    //     });
    // }

    if (isSSRCorrected && __SERVER__) return;
    if (!isSSRCorrected && __SERVER__ && getSSRContext().LocaleId) {
        resetLocaleId();
        resetL();
        isSSRCorrected = true;
        return;
    }

    if (__CLIENT__ && !__SPA__ && __DEV__) {
        l = getLocalesObject();
        return;
    }
    if (__CLIENT__ && !__SPA__) return;
    if (isSPACorrected && __SPA__) return;
    if (
        // SPA: 进一步确保语言包可用
        !isSPACorrected &&
        __SPA__ &&
        typeof window !== 'undefined' &&
        window.__KOOT_SSR_STATE__ &&
        typeof window.__KOOT_SSR_STATE__.locales === 'object' &&
        Object.keys(window.__KOOT_SSR_STATE__.locales).length &&
        (!l || !Object.keys(l).length)
    ) {
        l = window.__KOOT_SSR_STATE__.locales;
        isSPACorrected = true;
        return;
    }
};

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
    doCorrect();

    let key = '';
    let str;
    let options = {};
    const keys = [];

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
            value.split('.').forEach((value) => keys.push(value));
            return;
        }
        keys.push(value);
    });

    const length = keys.length;

    if (args.length === 1 && typeof args[0] === 'object') {
        /**
         * ! 如果只有一个 arg 且为 Object，直接返回该 Object
         */
        return args[0];
    }

    if (typeof keys[0] === 'object') {
        /**
         * 第一个值为 Object，通常是客户端情况，后续值依次取前一个 Object 内对应的值
         */
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
