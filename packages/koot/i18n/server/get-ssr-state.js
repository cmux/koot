import { get as getSSRContext } from '../../libs/ssr/context';

/**
 * 返回多语言相关的 SSR 状态
 * @returns {Object}
 */
const getSSRState = () => {
    if (!__SERVER__) return {};

    const { LocaleId: localeId, locales: localesAll } = getSSRContext();

    return {
        localeId,
        locales:
            JSON.parse(process.env.KOOT_I18N_TYPE) === 'store'
                ? localesAll[localeId] || {}
                : {},
    };
};
export default getSSRState;
