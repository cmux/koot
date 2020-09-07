import * as fullConfig from '__KOOT_PROJECT_CONFIG_PORTION_OTHER_CLIENT_PATHNAME__';

import React from 'react';
import { hydrate } from 'react-dom';
// import { syncHistoryWithStore } from 'react-router-redux'
import { match as routerMatch } from 'react-router';

// ----------------------------------------------------------------------------

import {
    localeId as LocaleId,
    store as Store,
    history as History,
} from '../../index';

// ----------------------------------------------------------------------------

import validateRouterConfig from '../../React/validate/router-config';
import { actionUpdate } from '../../React/realtime-location';
import Root from '../../React/root.jsx';
import { addEventHandlerOnPageUnload as addSessionStoreSaveEventHandlerOnPageUnload } from '../../React/client-session-store';

import i18nRegister from '../../i18n/register/isomorphic.client';
import { getLocalesObject } from '../../i18n/locales';

let logCountRouterUpdate = 0;
let logCountHistoryUpdate = 0;

/** @type {Number} react-router match 允许的最长运行时间 (ms) */
const maxRouterMatchTime = 5 * 1000;

// ----------------------------------------------------------------------------

/**
 * 判断变量是否是 Promise
 * @param {*} v
 * @returns {Boolean}
 */
const isPromise = (v) => {
    return typeof v === 'object' && typeof v.then === 'function';
};

/**
 * 处理生命周期方法，返回 Promise
 * @param {Function|Promise} func
 * @returns {Promise}
 */
const parseLifecycleMethod = (func) => {
    /** @type {Object} 生命周期方法传入的参数 */
    const argsLifecycle = {
        store: Store,
        history: History,
        localeId: LocaleId,
    };

    if (typeof func === 'function') {
        const result = func(argsLifecycle);
        if (isPromise(result)) return result;
        return new Promise((resolve) => resolve());
    }

    if (isPromise(func)) return func;

    return new Promise((resolve) => resolve());
};

// ----------------------------------------------------------------------------

const { router: routerConfig, client: clientConfig = {} } = fullConfig;

const { before, after } = clientConfig;
const onRouterUpdate = clientConfig.routerUpdate || clientConfig.onRouterUpdate;
const onHistoryUpdate =
    clientConfig.historyUpdate || clientConfig.onHistoryUpdate;

/** @type {Object} 路由根组件 props */
const routerProps = {
    onUpdate: (...args) => {
        if (__DEV__ && logCountRouterUpdate < 2) {
            // eslint-disable-next-line no-console
            console.log(`🚩 [koot/client] callback: onRouterUpdate`, ...args);
            logCountRouterUpdate++;
        }
        // if (__DEV__) console.log('router onUpdate', self.__LATHPATHNAME__, location.pathname)
        if (typeof onRouterUpdate === 'function') onRouterUpdate(...args);
    },
};

// 从 SSR 结果中初始化当前环境的语种
i18nRegister();

// 客户端流程正式开始
// 生命周期: 客户端流程正式开始前
// eslint-disable-next-line no-console
if (__DEV__) console.log(`🚩 [koot/client] callback: before`);
parseLifecycleMethod(before)
    .then(() => validateRouterConfig(routerConfig))
    .then(
        (
            /** @type {Object} 路由配置 */
            routes
        ) => {
            addSessionStoreSaveEventHandlerOnPageUnload();

            History.listen((location) => {
                // 回调: browserHistoryOnUpdate
                // 正常路由跳转时，URL发生变化后瞬间会触发，顺序在react组件读取、渲染之前
                // if (__DEV__) {
                //     console.log('🌏 browserHistory update', location)
                // }
                Store.dispatch(actionUpdate(location));

                if (__DEV__ && logCountHistoryUpdate < 2) {
                    // eslint-disable-next-line no-console
                    console.log(`🚩 [koot/client] callback: onHistoryUpdate`, [
                        location,
                        Store,
                    ]);
                    logCountHistoryUpdate++;
                }

                if (typeof onHistoryUpdate === 'function')
                    onHistoryUpdate(location, Store);
            });

            // const thisHistory = syncHistoryWithStore(History, Store)

            // require('react-router/lib/match')({ history, routes }, (err, ...args) => {
            //     console.log({ err, ...args })
            //     if (err) {
            //         console.log(err.stack)
            //     }
            // })
            // return hydrate(
            //     <Root
            //         store={Store}
            //         // history={thisHistory}
            //         history={History}
            //         routes={routes}
            //         // onError={(...args) => console.log('route onError', ...args)}
            //         // onUpdate={(...args) => console.log('route onUpdate', ...args)}
            //         {...routerProps}
            //     />,
            //     document.getElementById('root')
            // )
            let isRendered = false;
            const doHydrate = () => {
                if (isRendered) return;
                hydrate(
                    <Root
                        store={Store}
                        // history={thisHistory}
                        history={History}
                        routes={routes}
                        localeId={LocaleId}
                        locales={getLocalesObject()}
                        // onError={(...args) => console.log('route onError', ...args)}
                        // onUpdate={(...args) => console.log('route onUpdate', ...args)}
                        {...routerProps}
                    />,
                    document.getElementById('root')
                );
                isRendered = true;
            };

            let isRouterMatchComplete = false;
            return Promise.race([
                new Promise((resolve, reject) =>
                    setTimeout(() => {
                        if (!isRouterMatchComplete)
                            reject(new Error('routerMatch timeout'));
                    }, maxRouterMatchTime)
                ),
                new Promise((resolve, reject) => {
                    try {
                        routerMatch({ history: History, routes }, (
                            err /*, redirectLocation, renderProps*/
                        ) => {
                            isRouterMatchComplete = true;
                            if (err) return reject(err);
                            // console.log('\nrouter match', { err, ...args })
                            resolve();
                        });
                    } catch (e) {
                        isRouterMatchComplete = true;
                        reject(e);
                    }
                }),
            ])
                .then(doHydrate)
                .catch((err) => {
                    // eslint-disable-next-line no-console
                    console.log(
                        '\n⚛️Page may flash blank due to `react-router` match failed!'
                    );
                    console.error(err);
                    doHydrate();
                });
        }
    )
    .then(() => {
        // 生命周期: 客户端流程结束
        if (__DEV__) {
            // eslint-disable-next-line no-console
            console.log(`🚩 [koot/client] callback: after`);
        }
    })
    .then(parseLifecycleMethod(after));
