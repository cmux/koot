/**
 * 返回多语言相关的 SSR 状态
 * @returns {Object}
 */
const getSSRState = (SSRContext) => {
    if (!__SERVER__) return {};

    return {
        localeId: SSRContext.LocaleId,
        locales:
            JSON.parse(process.env.KOOT_I18N_TYPE) === 'store'
                ? SSRContext.locales[SSRContext.LocaleId] || {}
                : {},
    };
};
export default getSSRState;
