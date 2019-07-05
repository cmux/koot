// import useRouterHistory from 'react-router/lib/useRouterHistory'
// import createMemoryHistory from 'history/lib/createMemoryHistory'
// import { syncHistoryWithStore } from 'react-router-redux'

import getChunkmap from '../../../../utils/get-chunkmap';
import getSWPathname from '../../../../utils/get-sw-pathname';

import i18nGetLangFromCtx from '../../../../i18n/server/get-lang-from-ctx';
import getI18nType from '../../../../i18n/get-type';

// import initStore from './init-store'
import validateI18n from '../../validate/i18n';
import ssr from './ssr';

/**
 * KOA 中间件: 同构
 * @param {Object} options
 * @param {Object} options.reduxConfig Redux 配置
 * @param {Function} [options.reduxConfig.factoryStore] 生成 Redux Store 的方法。`factoryStore` 和 `store` 必须存在一个，且互斥
 * @param {Object} [options.reduxConfig.store] Redux Store 对象。`factoryStore` 和 `store` 必须存在一个，且互斥
 * @param {Object} [options.reduxConfig.syncCookie] 同步 cookie 到 store 的配置
 * @param {Object} options.routerConfig 路由配置对象，直接供 `react-router` 使用
 * @returns {Function} KOA middleware
 */
const middlewareIsomorphic = (options = {}) => {
    const {
        // reduxConfig,
        renderCacheMap,
        locales,
        proxyRequestOrigin = {},
        template,
        templateInject = {}
    } = options;
    // const ssrConfig = {}

    // const localeIds = getLocaleIds()
    // if (localeIds.length) {
    //     localeIds.forEach(localeId => {
    //         styleMap.set(localeId, {})
    //     })
    // } else {
    //     styleMap.set('', {})
    // }
    // const styleMap = {}

    /**
     * @type {Map}
     * 注入内容缓存
     * 则第一级为语种ID或 `` (空字符串)
     */
    const templateInjectCache = new Map();

    /** @type {Object} chunkmap */
    const chunkmap = getChunkmap(true);
    /** @type {Map} webpack 的入口，从 chunkmap 中抽取 */
    const entrypoints = new Map();
    /** @type {Map} 文件名与实际结果的文件名的对应表，从 chunkmap 中抽取 */
    const filemap = new Map();
    /** @type {Map} 样式表 */
    // const styleMap = new Map()

    /** @type {String} i18n 类型 */
    const i18nType = getI18nType();

    // 针对 i18n 分包形式的项目，静态注入按语言缓存
    if (i18nType === 'default') {
        for (let l in chunkmap) {
            const thisLocaleId = l.substr(0, 1) === '.' ? l.substr(1) : l;
            entrypoints.set(thisLocaleId, chunkmap[l]['.entrypoints']);
            filemap.set(thisLocaleId, chunkmap[l]['.files']);
            templateInjectCache.set(thisLocaleId, {
                pathnameSW: getSWPathname(thisLocaleId)
            });
            // styleMap.set(thisLocaleId, {})
        }
    } else {
        entrypoints.set('', chunkmap['.entrypoints']);
        filemap.set('', chunkmap['.files']);
        templateInjectCache.set('', {
            pathnameSW: getSWPathname()
        });
        // styleMap.set('', {})
    }

    return async (ctx, next) => {
        /** @type {String} 本次请求的 URL */
        const url = ctx.path + ctx.search;

        try {
            // console.log('request url', url)
            // console.log('\nSSR middleware start')

            /** @type {String} 本次请求的语种ID */
            const LocaleId = i18nGetLangFromCtx(ctx) || '';
            // setLocaleId(LocaleId)
            // console.log(`LocaleId -> ${LocaleId}`)

            // 如果存在缓存匹配，直接返回缓存结果
            const thisRenderCache = renderCacheMap
                ? renderCacheMap.get(LocaleId)
                : undefined;
            const cached = thisRenderCache ? thisRenderCache.get(url) : false;
            if (!__DEV__ && cached !== false) {
                ctx.body = cached;
                return;
            }

            /** @type {Object} 本次请求的 (当前语言的) 注入内容缓存 */
            const thisTemplateInjectCache = templateInjectCache.get(
                i18nType === 'default' ? LocaleId : ''
            );
            /** @type {Object} 本次请求的 (当前语言的) 入口表 */
            const thisEntrypoints = entrypoints.get(
                i18nType === 'default' ? LocaleId : ''
            );
            /** @type {Object} 本次请求的 (当前语言的) 文件名对应表 */
            const thisFilemap = filemap.get(
                i18nType === 'default' ? LocaleId : ''
            );
            /** @type {Object} 本次请求的 (当前语言的) CSS 对照表 */
            const styleMap = {};
            // const thisStyleMap = styleMap.get(i18nType === 'default' ? LocaleId : '')

            // 生成/清理 Store
            // console.log('\x1b[36m⚑\x1b[0m' + ' Store created')
            // const Store = initStore(reduxConfig)

            // 生成 History
            // const historyConfig = {
            //     basename: LocaleId && process.env.KOOT_I18N_URL_USE === 'router'
            //         ? `/${LocaleId}`
            //         : '/'
            // }
            // const memoryHistory = useRouterHistory(() => createMemoryHistory(url))(historyConfig)
            /** @type {Object} 已生成的 History 实例 */
            // const History = syncHistoryWithStore(memoryHistory, Store)

            // eval SSR
            // [开发环境] 每次请求都重新验证一次语言包，以确保语言包的更新
            const SSRoptions = {
                ctx,

                // Store, History,
                // memoryHistory,
                LocaleId,
                locales: __DEV__ ? await validateI18n() : locales,

                // ssrConfig,

                // syncCookie: reduxConfig.syncCookie,
                proxyRequestOrigin,
                templateInject,
                template,

                thisTemplateInjectCache,
                thisEntrypoints,
                thisFilemap, //thisStyleMap,
                styleMap,

                connectedComponents: __DEV__
                    ? global.__KOOT_SSR__.connectedComponents || []
                    : []
            };
            if (__DEV__) {
                // global.__KOOT_STORE__ = Store
                // global.__KOOT_HISTORY__ = History
                // global.__KOOT_LOCALEID__ = LocaleId
                // global.__KOOT_SSR__ = SSRoptions
                global.__KOOT_SSR_SET__(SSRoptions);
                global.__KOOT_SSR_SET_LOCALEID__(LocaleId);
            }
            const result = await ssr(SSRoptions);

            // console.log('eval finished', {
            //     'localeId in store': Store.getState().localeId
            // })
            // console.log('\n\n\n')

            if (result.body) {
                // HTML 结果暂存入缓存
                if (thisRenderCache) thisRenderCache.set(url, result.body);
                ctx.body = result.body;
                return;
            }

            if (result.error) throw result.error;

            if (result.redirect) return ctx.redirect(result.redirect);

            if (result.next) return await next();
        } catch (err) {
            require('debug')('SYSTEM:isomorphic:error')(
                'Server-Render Error Occures: %O',
                err.stack
            );
            console.error(err);
            ctx.status = 500;
            ctx.body = err.message;
            ctx.app.emit('error', err, ctx);
        }
    };
};

export default middlewareIsomorphic;
