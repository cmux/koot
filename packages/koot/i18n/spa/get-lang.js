import Cookies from 'js-cookie';
import { changeLocaleQueryKey } from '../../defaults/defines.js';
import availableLocaleIds from '../locale-ids.js';
import setCookie from '../set-cookie.js';
import isI18nEnabled from '../is-enabled.js';

/**
 * 根据当前环境获取语种ID
 * @returns {String} 匹配到的或当前项目默认语种ID
 */
const getLangSPA = () => {
    if (!isI18nEnabled()) return '';

    // 根据项目设置，从 URL 中抽取语种 ID
    if (process.env.KOOT_I18N_URL_USE === 'router') {
        let pathname = window.location.pathname;
        if (pathname.substr(0, 1) === '/') pathname = pathname.substr(1);
        pathname = pathname.split('/');
        if (availableLocaleIds.includes(pathname[0]))
            return setLocale(pathname[0]);
    } else {
        const query = {};
        window.location.search
            .split('?')
            .slice(1)
            .join('?')
            .split('&')
            .forEach((s) => {
                const [key, value] = s.split('=');
                query[key] = value;
            });
        if (query[changeLocaleQueryKey]) {
            if (availableLocaleIds.includes(query[changeLocaleQueryKey]))
                return setLocale(query[changeLocaleQueryKey]);
            return setLocale(availableLocaleIds[0]);
        }
    }

    // 如果上一步没有结果，从 COOKIE 中获取
    // const cookies = cookie.parse(ctx.request.header.cookie || '')
    // if (cookies[process.env.KOOT_I18N_COOKIE_KEY] && cookies[process.env.KOOT_I18N_COOKIE_KEY] !== 'null')
    //     return cookies[process.env.KOOT_I18N_COOKIE_KEY]
    const cookieValue = Cookies.get(process.env.KOOT_I18N_COOKIE_KEY);
    if (cookieValue && availableLocaleIds.includes(cookieValue)) {
        return cookieValue;
    }

    // 如果上一步没有结果，返回客户端语种或项目默认语种
    return setLocale(
        navigator.languages ||
            navigator.language ||
            navigator.browserLanguage ||
            navigator.systemLanguage ||
            navigator.userLanguage ||
            availableLocaleIds[0]
    );
};

export default getLangSPA;

/**
 * 服务器环境: 设置 cookie
 * @param {*} localeId
 */
const setLocale = (localeId) => {
    setCookie(localeId);
    return localeId;
};
