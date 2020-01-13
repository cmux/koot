import 'regenerator-runtime/runtime';
import { syncHistoryWithStore } from 'react-router-redux';
import * as portionConfig from '__KOOT_PROJECT_CONFIG_PORTION_CLIENT_PATHNAME__';
import validateReduxConfig from './validate/redux-config';
import History from './history';

window.__KOOT_STORE__ = ((reduxConfig = {}) => {
    if (typeof reduxConfig.factoryStore === 'function')
        return reduxConfig.factoryStore();
    if (typeof reduxConfig.store === 'object') return reduxConfig.store;
    return {};
})(validateReduxConfig(portionConfig.redux));

window.__KOOT_HISTORY__ = syncHistoryWithStore(History, window.__KOOT_STORE__);

// console filter
// https://stackoverflow.com/questions/6659312/is-there-a-way-to-filter-output-in-google-chromes-console
if (__DEV__) {
    (() => {
        window.console = window.console || { log: 0 };

        const nativeConsole = {
            log: window.console.log,
            info: window.console.info,
            error: window.console.error
        };
        window.__KOOT_DEV_NATIVE_CONSOLE__ = nativeConsole;

        const lastLog = {
            WDS: {
                time: undefined,
                log: undefined
            },
            HMR: {
                time: undefined,
                log: undefined
            }
        };
        const throttleHotLog = level => {
            window.console[level] = function() {
                try {
                    const args = Array.from(arguments);

                    // throttle `WDS` and `HMR` logs
                    const needThrottle = type => {
                        const regex = new RegExp(`^\\[${type}\\]`);
                        if (!args.some(arg => regex.test(arg))) return false;

                        const { [type]: last } = lastLog;
                        const now = Date.now();
                        const nowLogStr = args.join('|||');
                        const { time: lastTime, log: lastLogStr } = last;
                        lastLog[type] = {
                            time: now,
                            log: nowLogStr
                        };
                        // console.warn(type, last, now - lastTime)

                        if (
                            lastTime &&
                            now - lastTime < 50 &&
                            lastLogStr &&
                            lastLogStr === nowLogStr
                        )
                            return true;
                        return false;
                    };
                    if (needThrottle('WDS')) return;
                    if (needThrottle('HMR')) return;

                    nativeConsole[level].apply(window.console, arguments);
                } catch (e) {}
            };
        };
        // throttleHotLog('log')
        throttleHotLog('info');

        const warningShowed = {
            reactRouterV3: false,
            reactReduxV5: false
        };
        window.console.error = function() {
            try {
                const args = Array.from(arguments);

                // filter out `react-redux v5` & `react-router v3` warnings/erros
                if (
                    args.some(arg =>
                        /^Warning: Did not expect server HTML to contain a <%s> in <%s>\.$/.test(
                            arg
                        )
                    ) ||
                    (args.some(arg =>
                        /^Warning: Legacy context API has been detected within a strict-mode tree/.test(
                            arg
                        )
                    ) &&
                        args.some(
                            arg =>
                                arg === 'Link' ||
                                arg === 'Connect(KootReactComponent), Link'
                        )) ||
                    (args.some(arg =>
                        /^Warning: Unsafe lifecycle methods were found within a strict-mode tree/.test(
                            arg
                        )
                    ) &&
                        args.some(arg =>
                            /^componentWillReceiveProps: Please update the following components to use static getDerivedStateFromProps instead: .*?Link($|\n|\r)/.test(
                                arg
                            )
                        ))
                ) {
                    if (!warningShowed.reactRouterV3) {
                        console.warn(
                            '\n\n[koot] Koot.js is now using `react-router` v3 which will be upgraded to new version in future.\n\n\n'
                        );
                        warningShowed.reactRouterV3 = true;
                    }
                    return;
                }

                nativeConsole.error.apply(window.console, arguments);
            } catch (e) {}
        };
    })();
}
