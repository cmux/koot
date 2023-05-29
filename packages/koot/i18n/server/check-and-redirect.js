import availableLocaleIds from '../locale-ids.js';
import getLangFromCtx from './get-lang-from-ctx.js';
import setCookie from '../set-cookie.js';
import isI18nEnabled from '../is-enabled.js';

/**
 * 在同构中间件流程的匹配 react 路由之前，检查是否需要跳转
 * 如果需要跳转，此时发送跳转请求
 * @param {Object} ctx
 * @returns {Boolean} 是否进行跳转
 */
const checkRouterRedirect = (ctx) => {
    if (!isI18nEnabled()) return false;

    if (process.env.KOOT_I18N_URL_USE === 'router') {
        let pathname = ctx.path;
        if (pathname.substr(0, 1) === '/') pathname = pathname.substr(1);
        pathname = pathname.split('/');

        if (!availableLocaleIds.includes(pathname[0])) {
            const localeId = getLangFromCtx(ctx);

            // console.log('lang', lang)
            // console.log('pathname', pathname)
            // console.log(' \n', {
            //     'ctx.url': ctx.url,
            //     'ctx.origin': ctx.origin,
            //     'ctx.originalUrl': ctx.originalUrl,
            //     'ctx.originTrue': ctx.originTrue,
            //     'ctx.href': ctx.href,
            //     'ctx.hrefTrue': ctx.hrefTrue,
            //     'ctx.protocol': ctx.protocol,
            //     'ctx.path': ctx.path,
            //     pathname,
            // });

            pathname.unshift(localeId);
            pathname = '/' + pathname.join('/');

            // 生成跳转后的地址
            let newpath =
                ctx.originTrue +
                ctx.hrefTrue
                    .replace(new RegExp(`^${ctx.originTrue}`), '')
                    .replace(new RegExp(`^${ctx.path}`), pathname);

            if (process.env.WEBPACK_BUILD_ENV === 'dev')
                newpath = newpath.replace(/^https:\/\//, 'http://');

            ctx.hrefTrue = newpath;

            // console.log('redirect to: ', {
            //     newpath,
            // });

            // console.log('newpath', newpath)
            setCookie(localeId, ctx);
            return ctx.redirect(newpath);
        }
    }

    if (process.env.KOOT_I18N_URL_USE === 'subdomain') {
        const domainSplit = ctx.hostname.split('.');
        const doRedirect = (localeId) => {
            setCookie(localeId, ctx);
            ctx.originTrue = ctx.originTrue.replace(
                new RegExp(`://${ctx.hostname}`),
                `://${localeId}.${domainSplit.join('.')}`
            );
            ctx.hrefTrue = ctx.hrefTrue.replace(
                new RegExp(`://${ctx.hostname}`),
                `://${localeId}.${domainSplit.join('.')}`
            );
            if (process.env.WEBPACK_BUILD_ENV === 'dev')
                ctx.hrefTrue = ctx.hrefTrue.replace(/^https:\/\//, 'http://');
            return ctx.redirect(ctx.hrefTrue);
        };

        if (domainSplit.length === 1) {
            return doRedirect(availableLocaleIds[0]);
        }

        if (availableLocaleIds.includes(domainSplit[0])) return false;

        domainSplit.shift();
        return doRedirect(availableLocaleIds[0]);
    }

    return false;
};

export default checkRouterRedirect;
