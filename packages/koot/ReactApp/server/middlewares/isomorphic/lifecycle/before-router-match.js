import { TELL_CLIENT_URL, SYNC_COOKIE } from '../../../../action-types';
import i18nCheckAndRedirect from '../../../../../i18n/server/check-and-redirect';
// import isI18nEnabled from '../../../../../i18n/is-enabled'
import log from '../../../../../libs/log';

const beforeRouterMatch = async ({ store, ctx, syncCookie, callback }) => {
    // 如果 i18n 判定需要跳转，此时进行处理
    const needRedirect = i18nCheckAndRedirect(ctx);
    if (needRedirect) return needRedirect;

    // 告诉前端，当前的url是啥
    store.dispatch({ type: TELL_CLIENT_URL, data: ctx.originTrue });

    // 把http请求带来的cookie同步到ssr的初始化redux state里
    // server.cookie 获取
    // 配置信息在koot.config.js里
    // redux.syncCookie = ['token', 'sid'] | 'token' | false
    if (syncCookie) {
        let cookies = syncCookie;

        if (cookies === true) {
            store.dispatch({
                type: SYNC_COOKIE,
                data: ctx.headers.cookie || '',
            });
        } else {
            const data = {};
            if (cookies === 'all') {
                const theCookies = ctx.headers.cookie || '';
                theCookies.split(';').forEach((str) => {
                    const crumbs = str.split('=');
                    if (crumbs.length > 1) {
                        const [key, ...values] = crumbs;
                        data[key.trim()] = values.join('=').trim();
                    }
                });
            } else {
                if (typeof cookies === 'string') cookies = [cookies];

                if (Array.isArray(cookies)) {
                    // 获取需要的cookie值
                    cookies.forEach((c) => {
                        data[c] = ctx.cookies.get(c);
                    });
                }
            }

            // 同步到state中
            store.dispatch({ type: SYNC_COOKIE, data });
        }

        // console.log({
        //     syncCookie,
        //     cookies: ctx.headers.cookie,
        //     server: store.getState().server
        // });
    }

    if (__DEV__) log('callback', 'server', 'beforeRouterMatch');
    if (typeof callback === 'function') await callback({ store, ctx });
};

export default beforeRouterMatch;
