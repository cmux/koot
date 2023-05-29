import jsCookie from 'js-cookie';

/**
 * 设置 cookie
 * @param {String} localeId
 * @param {Object} ctx Koa context
 */
const setCookie = (localeId, ctx) => {
    const maxDate = 365;
    const options = {};
    if (
        typeof process.env.KOOT_I18N_COOKIE_DOMAIN === 'string' &&
        process.env.KOOT_I18N_COOKIE_DOMAIN
    ) {
        options.domain = process.env.KOOT_I18N_COOKIE_DOMAIN;
    }

    if (__CLIENT__) {
        if (
            localeId &&
            typeof document !== 'undefined' &&
            typeof document.cookie !== 'undefined'
        ) {
            jsCookie.set(process.env.KOOT_I18N_COOKIE_KEY, localeId, {
                expires: maxDate,
                ...options,
            });
        }
    }

    if (__SERVER__) {
        // TODO: set cookie on server
        // console.log('ctx.host', ctx.host)
        // console.log('ctx.hostname', ctx.hostname)
        // console.log(process.env.KOOT_I18N_COOKIE_KEY, localeId, { domain: ctx.hostname, ...options })
        // ctx.cookies.set(process.env.KOOT_I18N_COOKIE_KEY, localeId, {
        //     domain: ctx.hostname,
        //     maxAge: maxDate * 24 * 60 * 60 * 1000,
        //     signed: false,
        //     ...options
        // })
    }
};

export default setCookie;
