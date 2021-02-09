/* __KOOT_DEV_NO_REACT_HOT_INJECT__ */
// import 'regenerator-runtime/runtime';
import { renderToString } from 'react-dom/server';
import { match, useRouterHistory as doUseRouterHistory } from 'react-router';
import createMemoryHistory from 'history/lib/createMemoryHistory';
import { syncHistoryWithStore } from 'react-router-redux';

import * as kootConfig from '__KOOT_PROJECT_CONFIG_FULL_PATHNAME__';

import {
    set as setSSRContext,
    get as getSSRContext,
    reset as resetSSRContext,
    resetStore,
    resetHistory,
} from '../../libs/ssr/context';
import RootIsomorphic from './root-isomorphic';

import { publicPathPrefix } from '../../defaults/webpack-dev-server';
import {
    needConnectComponents,
    ssrContext as SSRContext,
    koaContext as KOAContext,
} from '../../defaults/defines-server';
import { CHANGE_LANGUAGE } from '../action-types';

import validateRouterConfig from '../../React/validate/router-config';
import validateInject from '../../React/validate-inject';
import validateReduxConfig from '../../React/validate/redux-config';
import isNeedInjectCritical from '../../React/inject/is-need-inject-critical';
import renderTemplate from '../../React/render-template';
import {
    default as clearStore,
    defaultKeysToPreserve,
} from '../../React/redux/reset-store';
import injectCacheKeys from '../../React/inject/_cache-keys';

import beforeRouterMatch from './middlewares/isomorphic/lifecycle/before-router-match';
import beforePreRender from './middlewares/isomorphic/lifecycle/before-pre-render';
import beforeDataToStore from './middlewares/isomorphic/lifecycle/before-data-to-store';
import afterDataToStore from './middlewares/isomorphic/lifecycle/after-data-to-store';
import executeComponentsLifecycle from './middlewares/isomorphic/execute-components-lifecycle';
import initStore from './middlewares/isomorphic/init-store';

// import i18nOnServerRender from '../../i18n/onServerRender';
import { actionInit as i18nActionInit } from '../../i18n/redux';
import i18nGenerateHtmlRedirectMetas from '../../i18n/server/generate-html-redirect-metas';
import i18nGetSSRState from '../../i18n/server/get-ssr-state';

async function ssr(ctx) {
    setSSRContext(ctx);

    const SSR = getSSRContext();
    const { LocaleId } = SSR;

    /** @type {string} 本次请求的 URL */
    const url = ctx.path + ctx.search;

    // ========================================================================

    const { redux: reduxConfigRaw = {} } = kootConfig;
    const reduxConfig = await validateReduxConfig(reduxConfigRaw);

    // 生成 History
    const historyConfig = {
        basename:
            LocaleId && process.env.KOOT_I18N_URL_USE === 'router'
                ? `/${LocaleId}`
                : '/',
    };
    /* eslint-disable react-hooks/rules-of-hooks */
    const memoryHistory = doUseRouterHistory(() => createMemoryHistory(url))(
        historyConfig
    );

    // 生成/清理 Store
    // console.log('\x1b[36m⚑\x1b[0m' + ' Store created')
    const Store = initStore(reduxConfig);

    /** @type {Object} 已生成的 History 实例 */
    const History = syncHistoryWithStore(memoryHistory, Store);

    const { syncCookie } = reduxConfig;

    if (__DEV__) {
        // global.__KOOT_STORE__ = Store
        // global.__KOOT_HISTORY__ = History
        global.__KOOT_SSR_SET_STORE__(Store);
        global.__KOOT_SSR_SET_HISTORY__(History);
        global.__KOOT_SSR_SET_CTX__(ctx);
    } else {
        resetStore(Store);
        resetHistory(History);
    }

    // ========================================================================

    // console.log({
    //     LocaleId,
    //     Store,
    //     History,
    //     SSR
    // })

    /** @type {Boolean} i18n 是否启用 */
    const i18nEnabled = Boolean(LocaleId);

    const { proxyRequestOrigin = {}, ssrComplete: _complete } = SSR;

    function ssrComplete(...args) {
        if (!__DEV__) {
            resetSSRContext();
            // SSR = undefined;
            ctx = undefined;
            purgeObject(global);
        }
        _complete(...args);
    }

    ctx.originTrue = proxyRequestOrigin.protocol
        ? ctx.origin.replace(/^http:\/\//, `${proxyRequestOrigin.protocol}://`)
        : ctx.origin;
    ctx.hrefTrue = proxyRequestOrigin.protocol
        ? ctx.href.replace(/^http:\/\//, `${proxyRequestOrigin.protocol}://`)
        : ctx.href;

    const { lifecycle, routerConfig: routes } = await initConfig(
        i18nEnabled,
        LocaleId
    );

    // 渲染生命周期: beforeRouterMatch
    await beforeRouterMatch({
        ctx,
        store: Store,
        syncCookie,
        callback: lifecycle.beforeRouterMatch,
    });
    if (LocaleId) {
        Store.dispatch({ type: CHANGE_LANGUAGE, data: LocaleId });
        Store.dispatch(i18nActionInit(LocaleId));
        // i18nOnServerRender(Store, LocaleId);
    }
    // console.log('after router match', ctx.hrefTrue, LocaleId);

    // 进行路由匹配
    const { redirectLocation, renderProps } = await new Promise(
        (resolve, reject) => {
            match(
                {
                    history: History,
                    routes,
                    location: url,
                },
                (error, redirectLocation, renderProps) => {
                    if (error) return reject(error);
                    resolve({ redirectLocation, renderProps });
                }
            );
        }
    );

    // 如果需要重定向，派发 ctx.redirect / 302
    if (redirectLocation) {
        ssrComplete({
            redirect: redirectLocation.pathname + redirectLocation.search,
        });
        return;
    }

    // 如果没有匹配，终止本中间件流程，执行其他中间件
    // 表示 react 不应处理该请求
    if (!renderProps) {
        ssrComplete({
            next: true,
        });
        return;
    }

    // 强制更新 store: state.routing.locationBeforeTransitions
    const state = Store.getState();
    const currentPathname = state.routing.locationBeforeTransitions.pathname;
    if (currentPathname.split(0, 1) !== '/')
        Object.assign(Store.getState().routing.locationBeforeTransitions, {
            pathname: ctx.path,
            // search: ctx.search
        });

    // 渲染生命周期: beforePreRender
    await beforePreRender({
        ctx,
        store: Store,
        localeId: LocaleId,
        callback: lifecycle.beforePreRender,
    });

    const rootProps = {
        store: Store,
        history: History,
        localeId: LocaleId,
        locales: SSR.locales,
        styles: SSR.styleMap,
        ctx,
        ...renderProps,
    };

    // 确定当前访问匹配到的组件
    SSR[needConnectComponents] = true;
    SSR.connectedComponents = [];
    try {
        renderToString(<RootIsomorphic {...rootProps} />);
    } catch (e) {}
    SSR[needConnectComponents] = false;

    // 重置 state
    clearStore(Store, [...defaultKeysToPreserve, 'server', 'routing']);

    // 渲染生命周期: beforeDataToStore
    await beforeDataToStore({
        ctx,
        store: Store,
        localeId: LocaleId,
        callback: lifecycle.beforeDataToStore,
    });

    // 执行所有匹配到的组件的自定义的静态生命周期
    const { title, metaHtml, reduxHtml } = await executeComponentsLifecycle({
        store: Store,
        renderProps,
        ctx,
    });

    // 渲染生命周期: afterDataToStore
    await afterDataToStore({
        ctx,
        store: Store,
        localeId: LocaleId,
        callback: lifecycle.afterDataToStore,
    });

    // SSR
    const reactHtml = renderToString(<RootIsomorphic {...rootProps} />);

    // console.log({
    //     // __KOOT_SSR__,
    //     // thisTemplateInjectCache: SSR.thisTemplateInjectCache,
    //     // thisEntrypoints: SSR.thisEntrypoints,
    //     // thisFilemap: SSR.thisFilemap,
    //     thisStyleMap,
    //     // templateInject: SSR.templateInject,
    //     // proxyRequestOrigin,
    // })
    // const stylesHtml = Object.keys(thisStyleMap)
    //     .filter(id => typeof thisStyleMap[id].css === 'string')
    //     .map(id => `<style id="${id}">${thisStyleMap[id].css}</style>`)
    //     .join('')
    const stylesHtml = Object.keys(SSR.styleMap)
        .filter(
            (id) =>
                typeof SSR.styleMap[id].css === 'string' &&
                SSR.styleMap[id].css !== ''
        )
        .map(
            (id) =>
                `<style ${__STYLE_TAG_MODULE_ATTR_NAME__}="${id}">${SSR.styleMap[id].css}</style>`
        )
        .join('');
    // console.log('result thisStyleMap', thisStyleMap)

    // 渲染 EJS 模板
    const inject = validateInject({
        injectCache: SSR.thisTemplateInjectCache,
        filemap: SSR.thisFilemap,
        entrypoints: SSR.thisEntrypoints,
        manifest: SSR.thisManifest,
        localeId: LocaleId,
        title,
        metaHtml,
        reactHtml,
        stylesHtml,
        reduxHtml,
        SSRState: i18nGetSSRState(SSR),
        needInjectCritical: isNeedInjectCritical(SSR.template),
    });
    if (LocaleId) {
        // i18n 启用时: 添加其他语种页面跳转信息的 meta 标签
        inject.metas += i18nGenerateHtmlRedirectMetas({
            ctx,
            proxyRequestOrigin,
            localeId: LocaleId,
        });
    }

    // > Memory stable ========================================================

    /** @type {String} HTML 结果 */
    let body = renderTemplate({
        template: SSR.template,
        inject: {
            ...inject,
            ...SSR.templateInject,
        },
        store: Store,
        ctx,
    });

    // 结果写入缓存
    if (__DEV__) {
        if (injectCacheKeys) {
            for (const k of Object.values(injectCacheKeys)) {
                delete SSR.thisTemplateInjectCache[k];
            }
        }

        // 将结果中指向 webpack-dev-server 的 URL 转换为指向本服务器的代理地址
        // 替换 localhost 为 origin，以允许外部请求访问
        const origin = ctx.originTrue.split('://')[1];
        // origin = origin.split(':')[0]
        body = body.replace(
            /:\/\/localhost:([0-9]+)/gm,
            `://${origin}/${publicPathPrefix}`
        );
    }

    // React SSR
    ssrComplete({
        body,
    });
}

/**
 * 初始化 SSR 配置
 * @param {*} i18nEnabled
 */
const initConfig = async (i18nEnabled, LocaleId) => {
    // const LocaleId = __DEV__ ? global.__KOOT_LOCALEID__ : __KOOT_LOCALEID__;

    const { server: serverConfig = {} } = kootConfig;

    const config = {};

    // 决定路由配置 (每次请求需重新生成)
    config.routerConfig = await validateRouterConfig(kootConfig.router);

    if (typeof i18nEnabled === 'undefined') i18nEnabled = Boolean(LocaleId);

    config.lifecycle = {};
    if (typeof serverConfig.onRender === 'function') {
        config.lifecycle.beforeDataToStore = serverConfig.onRender;
    } else if (typeof serverConfig.onRender === 'object') {
        Object.keys(serverConfig.onRender).forEach((key) => {
            config.lifecycle[key] = serverConfig.onRender[key];
        });
    }

    return config;
};

if (!__DEV__) {
    // eslint-disable-next-line no-eval
    const ctx = eval(KOAContext);
    ssr(ctx).catch((err) => {
        ctx[SSRContext].ssrComplete({
            error: err,
        });
        // console.error(err);
        // throw err;
    });
}

export default ssr;

// ============================================================================

const purgeObject = (obj) => {
    if (typeof obj !== 'object') return;
    for (const key of Object.keys(obj)) {
        if (typeof obj[key] === 'object') purgeObject(obj[key]);
        delete obj[key];
    }
};
