// import useRouterHistory from 'react-router/lib/useRouterHistory'
// import createMemoryHistory from 'history/lib/createMemoryHistory'
// import { syncHistoryWithStore } from 'react-router-redux'

import { ssrContext as SSRContext } from '../../../../defaults/defines-server';
import { serviceWorker as devRequestServiceWorker } from '../../../../defaults/dev-request-uri';
import { uriServiceWorker } from '../../../../React/inject/_cache-keys';

import getChunkmap from '../../../../utils/get-chunkmap';
import getSWPathname from '../../../../utils/get-sw-pathname';
import log from '../../../../libs/log';

import i18nGetLangFromCtx from '../../../../i18n/server/get-lang-from-ctx';
import getI18nType from '../../../../i18n/get-type';
import localesIds from '../../../../i18n/locale-ids';
import { setLocales } from '../../../../i18n/locales';

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
        templateInject = {},
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
    /** @type {Object} 公用缓存空间 */
    const globalCache = new Map();
    globalCache.set('__', {});

    /** @type {String} i18n 类型 */
    const i18nType = getI18nType();

    // 针对 i18n 分包形式的项目，静态注入按语言缓存
    if (i18nType === 'default') {
        for (const l in chunkmap) {
            const thisLocaleId = l.substr(0, 1) === '.' ? l.substr(1) : l;
            entrypoints.set(thisLocaleId, chunkmap[l]['.entrypoints']);
            filemap.set(thisLocaleId, chunkmap[l]['.files']);
            const cache = {};
            if (!__DEV__) {
                extendCacheObject(cache, chunkmap, l);
            }
            templateInjectCache.set(thisLocaleId, cache);
            // styleMap.set(thisLocaleId, {})
        }
    } else {
        entrypoints.set('', chunkmap['.entrypoints']);
        filemap.set('', chunkmap['.files']);
        const cache = {};
        if (!__DEV__) {
            extendCacheObject(cache, chunkmap);
        }
        templateInjectCache.set('', cache);
        // styleMap.set('', {})
    }

    if (Array.isArray(localesIds)) {
        localesIds.forEach((localeId) => {
            globalCache.set(localeId, {});
            // Object.defineProperty(globalCache, localeId, {
            //     value: {},
            //     enumerable: false,
            //     writable: false,
            //     configurable: false
            // });
        });
    }

    return async (ctx, next) => {
        /** @type {String} 本次请求的 URL */
        const url = ctx.path + ctx.search;
        // console.log(' ');
        // console.log({
        //     href: ctx.href,
        //     [SSRContext]: ctx[SSRContext],
        // });

        function renderComplete() {
            purgeSSRContext(ctx);

            if (__DEV__) {
                log('success', 'server', `render success ${ctx.href}\n\n\n\n`);
                // [开发环境] 请求完成后，触发 server/index.js 保存，让 PM2 重启服务器
                //     const fileServer = path.resolve(getDist(), 'server/index.js');
                //     if (fs.existsSync(fileServer)) {
                //         await sleep(200);
                //         const content = await fs.readFile(fileServer, 'utf-8');
                //         await fs.writeFile(fileServer, content, 'utf-8');
                //     }
            }
            // log('success', 'server', `render success ${ctx.href}\n`);
        }

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
                renderComplete();
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
            const thisLocales = __DEV__ ? await validateI18n() : locales;

            if (__DEV__) {
                extendCacheObject(
                    thisTemplateInjectCache,
                    chunkmap,
                    i18nType === 'default' ? LocaleId : undefined
                );
                setLocales(thisLocales);
            }

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

            Object.defineProperty(ctx, SSRContext, {
                configurable: true,
                enumerable: false,
                writable: true,
                value: {
                    // ctx,

                    // Store, History,
                    // memoryHistory,
                    LocaleId,
                    locales: thisLocales,

                    // ssrConfig,

                    // syncCookie: reduxConfig.syncCookie,
                    proxyRequestOrigin,
                    templateInject,
                    template,

                    thisTemplateInjectCache,
                    thisEntrypoints,
                    thisFilemap, //thisStyleMap,
                    styleMap,
                    globalCache,

                    connectedComponents: __DEV__
                        ? (global[SSRContext]
                              ? global[SSRContext].connectedComponents
                              : []) || []
                        : [],
                },
            });
            if (__DEV__) {
                // global.__KOOT_STORE__ = Store
                // global.__KOOT_HISTORY__ = History
                // global.__KOOT_LOCALEID__ = LocaleId
                // global[SSRContext] = SSRoptions
                global.__KOOT_SSR_SET__(ctx);
                global.__KOOT_SSR_SET_LOCALEID__(LocaleId);
            }
            const result = await ssr(ctx);

            // console.log('eval finished', {
            //     'localeId in store': Store.getState().localeId
            // })
            // console.log('\n\n\n')

            if (result.body) {
                // HTML 结果暂存入缓存
                if (thisRenderCache) thisRenderCache.set(url, result.body);
                ctx.body = result.body;
                renderComplete();
                return;
            }

            if (result.error) {
                renderComplete();
                throw result.error;
            }

            if (result.redirect) {
                renderComplete();
                return ctx.redirect(result.redirect);
            }

            if (result.next) {
                renderComplete();
                return await next();
            }
        } catch (err) {
            require('debug')('SYSTEM:isomorphic:error')(
                'Server-Render Error Occures: %O',
                err.stack
            );
            console.error(err);
            ctx.status = 500;
            ctx.body = err.message;
            ctx.app.emit('error', err, ctx);
            renderComplete();
            return;
        }
    };
};

export default middlewareIsomorphic;

// ============================================================================

const extendCacheObject = (cache, chunkmap, localeId) => {
    const serviceWorker = getSWPathname(
        localeId ? chunkmap[localeId] : chunkmap
    );
    if (serviceWorker) {
        cache[uriServiceWorker] = __DEV__
            ? devRequestServiceWorker
            : serviceWorker;
    }
};

/**
 * 清理 SSR Context 对象。清楚内容
 * - 所有第一级的对象
 * - store
 * - ctx 上的 Context 对象
 * @param {*} ctx
 */
const purgeSSRContext = (ctx) => {
    if (__DEV__) return;

    if (typeof ctx[SSRContext] === 'object') {
        // store
        purgeObject(ctx[SSRContext].Store);
        if (typeof ctx[SSRContext].Store === 'object') {
            delete ctx[SSRContext].Store['Symbol(observable)'];
        }
        // history
        purgeObject(ctx[SSRContext].History);

        for (const key of Object.keys(ctx[SSRContext]))
            delete ctx[SSRContext][key];
    }
    delete ctx[SSRContext];
};

const purgeObject = (obj) => {
    if (typeof obj !== 'object') return;
    for (const key of Object.keys(obj)) {
        if (typeof obj[key] === 'object') purgeObject(obj[key]);
        delete obj[key];
    }
};
