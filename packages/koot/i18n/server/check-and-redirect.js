import availableLocaleIds from '../locale-ids';
import getLangFromCtx from './get-lang-from-ctx';
import setCookie from '../set-cookie';
import isI18nEnabled from '../is-enabled';

/**
 * 在同构中间件流程的匹配 react 路由之前，检查是否需要跳转
 * 如果需要跳转，此时发送跳转请求
 * @param {Object} ctx
 * @returns {Boolean} 是否进行跳转
 */
const useRouterRedirect = (ctx) => {
    if (!isI18nEnabled()) return false;

    if (process.env.KOOT_I18N_URL_USE === 'router') {
        let pathname = ctx.path;
        if (pathname.substr(0, 1) === '/') pathname = pathname.substr(1);
        pathname = pathname.split('/');

        if (!availableLocaleIds.includes(pathname[0])) {
            const localeId = getLangFromCtx(ctx);

            // console.log('lang', lang)
            // console.log('pathname', pathname)

            pathname.unshift(localeId);
            pathname = '/' + pathname.join('/');

            // 生成跳转后的地址
            const newpath =
                ctx.originTrue +
                ctx.hrefTrue
                    .replace(new RegExp(`^${ctx.originTrue}`), '')
                    .replace(new RegExp(`^${ctx.path}`), pathname);
            ctx.hrefTrue = newpath;

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

export default useRouterRedirect;
