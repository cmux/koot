/* __KOOT_DEV_NO_REACT_HOT_INJECT__ */
import ReactDOM from 'react-dom';
import history from '../../React/history';

//

import {
    // localeId as LocaleId,
    // store as Store,
    getStore,
    getHistory,
} from '../../index';
import {
    LOCALEID,
    SSRSTATE,
    SPALOCALEFILEMAP,
} from '../../defaults/defines-window';
import { actionUpdate } from '../../React/realtime-location';
import Root from '../../React/root.jsx';
import validateRouterConfig from '../../React/validate/router-config';
import { addEventHandlerOnPageUnload as addSessionStoreSaveEventHandlerOnPageUnload } from '../../React/client-session-store';

// import {
//     reducerLocaleId as i18nReducerLocaleId,
//     reducerLocales as i18nReducerLocales,
// } from 'koot/i18n/redux'
// import i18nRegister from 'koot/i18n/register/spa.client'

// ============================================================================
// 设置常量 & 变量
// ============================================================================

let logCountRouterUpdate = 0;
let logCountHistoryUpdate = 0;

const checkSPAI18n = () =>
    Boolean(
        process.env.WEBPACK_BUILD_TYPE === 'spa' &&
            typeof window[SPALOCALEFILEMAP] === 'object' &&
            window[LOCALEID] &&
            typeof window[SSRSTATE].locales === 'undefined'
    );

const run = ({ router, client }) =>
    new Promise((resolve) => {
        // [SPA/多语言] 检查语言包是否准备完毕，如果仍在准备，轮询
        if (checkSPAI18n()) {
            const interval = setInterval(() => {
                if (!checkSPAI18n()) {
                    clearInterval(interval);
                    return resolve();
                }
            }, 10);
        } else {
            return resolve();
        }
    })
        .then(() => validateRouterConfig(router))
        .then((routes) => {
            if (__DEV__) console.warn('CLIENT RUN');
            addSessionStoreSaveEventHandlerOnPageUnload();

            const Store = getStore();

            // console.log({
            //     router,
            //     redux,
            //     client
            // })

            const { before, after } = client;
            const onRouterUpdate = client.routerUpdate || client.onRouterUpdate;
            const onHistoryUpdate =
                client.historyUpdate || client.onHistoryUpdate;

            // ============================================================================
            // i18n 初始化
            // ============================================================================
            // if (i18n) i18nRegister(i18n, store)

            // ============================================================================
            // 路由初始化
            // ============================================================================
            // const routes = validateRouterConfig(router);
            if (typeof routes.path === 'undefined') routes.path = '/';
            const History = getHistory();
            // const thisHistory = syncHistoryWithStore(History, Store)
            const routerConfig = {
                // history: syncHistoryWithStore(memoryHistory, store),
                history: History,
                routes,
                onUpdate: (...args) => {
                    if (__DEV__ && logCountRouterUpdate < 2) {
                        // eslint-disable-next-line no-console
                        console.log(
                            `🚩 [koot/client] callback: onRouterUpdate`,
                            ...args
                        );
                        logCountRouterUpdate++;
                    }
                    // if (__DEV__) console.log('router onUpdate', self.__LATHPATHNAME__, location.pathname)
                    if (typeof onRouterUpdate === 'function')
                        onRouterUpdate(...args);
                },
            };
            // const history = hashHistory
            // if (__CLIENT__) self.routerHistory = memoryHistory
            // if (__CLIENT__) self.routerHistory = hashHistory
            // memoryHistory.listen(location => {
            History.listen((location) => {
                // if (__DEV__) {
                //     console.log('🌏 browserHistory update', location)
                // }
                // console.log(actionUpdate(location))
                Store.dispatch(actionUpdate(location));
                // console.log(store.getState())

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

            // ============================================================================
            // React 初始化
            // ============================================================================

            if (__DEV__) {
                // eslint-disable-next-line no-console
                console.log(`🚩 [koot/client] callback: before`, {
                    store: Store,
                    history: History,
                    // localeId: LocaleId
                });
            }

            const beforePromise = (() => {
                const _before =
                    typeof before === 'function'
                        ? before({
                              store: Store,
                              history: History,
                              // localeId: LocaleId
                          })
                        : before;

                if (
                    typeof _before === 'object' &&
                    typeof _before.then === 'function'
                ) {
                    return _before;
                }

                return new Promise((resolve) => {
                    if (typeof _before === 'function')
                        _before({
                            store: Store,
                            history: History,
                            // localeId: LocaleId
                        });
                    resolve();
                });
            })();

            return beforePromise
                .then(() => {
                    if (__DEV__) {
                        // eslint-disable-next-line no-console
                        console.log(`🚩 [koot/client] callback: after`, {
                            store: Store,
                            history,
                        });
                    }
                    if (typeof after === 'function')
                        after({
                            // Store,
                            store: Store,
                            // history
                            history: History,
                        });
                })
                .then(() => {
                    // console.log('store', store)
                    // console.log('routerConfig', routerConfig)

                    const { history, routes, ...ext } = routerConfig;
                    // console.log(routes)

                    ReactDOM.render(
                        <Root
                            store={Store}
                            history={history}
                            routes={routes}
                            localeId={window[LOCALEID]}
                            locales={window[SSRSTATE].locales}
                            {...ext}
                        />,
                        document.getElementById('root')
                    );

                    return true;
                });
        });

export default run;
