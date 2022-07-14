import 'regenerator-runtime/runtime';
import { syncHistoryWithStore } from 'react-router-redux';
import * as portionConfig from '__KOOT_PROJECT_CONFIG_PORTION_CLIENT_PATHNAME__';
import { STORE, HISTORY, DEV_NATIVE_CONSOLE } from '../defaults/defines-window';
import validateReduxConfig from './validate/redux-config';
import History from './history';

window[STORE] = ((reduxConfig = {}) => {
    if (typeof reduxConfig.factoryStore === 'function')
        return reduxConfig.factoryStore();
    if (typeof reduxConfig.store === 'object') return reduxConfig.store;
    return {};
})(validateReduxConfig(portionConfig.redux));

window[HISTORY] = syncHistoryWithStore(History, window[STORE]);

// console filter
// https://stackoverflow.com/questions/6659312/is-there-a-way-to-filter-output-in-google-chromes-console
if (__DEV__) {
    (() => {
        // eslint-disable-next-line no-console
        console.info('💕 [DEV] Thanks for using Koot.js');

        window.console = window.console || { log: 0 };

        const nativeConsole = {
            log: window.console.log,
            info: window.console.info,
            error: window.console.error,
        };
        window[DEV_NATIVE_CONSOLE] = nativeConsole;

        const lastLog = {
            WDS: {
                time: undefined,
                log: undefined,
            },
            HMR: {
                time: undefined,
                log: undefined,
            },
        };
        const throttleHotLog = (level) => {
            window.console[level] = function () {
                try {
                    const args = Array.from(arguments);

                    // throttle `WDS` and `HMR` logs
                    const needThrottle = (type) => {
                        const regex = new RegExp(`^\\[${type}\\]`);
                        if (!args.some((arg) => regex.test(arg))) return false;

                        const { [type]: last } = lastLog;
                        const now = Date.now();
                        const nowLogStr = args.join('|||');
                        const { time: lastTime, log: lastLogStr } = last;
                        lastLog[type] = {
                            time: now,
                            log: nowLogStr,
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
            reactReduxV5: false,
        };
        window.console.error = function () {
            try {
                const args = Array.from(arguments);

                // filter out SSR not matching error
                // will fix this by using koot's own async component
                // SOON™
                if (
                    args.some((arg) =>
                        /^Warning: Did not expect server HTML to contain a <%s> in <%s>\.$/.test(
                            arg
                        )
                    )
                )
                    return;

                // filter out react-router v3` warnings/errors
                if (
                    (/^Warning: Legacy context API has been detected within a strict-mode tree/.test(
                        args[0]
                    ) &&
                        args.some((arg) => arg === 'Link')) ||
                    (/^Warning: Using UNSAFE_[a-zA-Z]+ in strict mode/.test(
                        args[0]
                    ) &&
                        /(Link)(\r|\n|,|\(|$)/.test(args[1]))
                ) {
                    if (!warningShowed.reactRouterV3) {
                        // eslint-disable-next-line no-console
                        console.info(
                            '\n[koot] Koot.js is now using `react-router` v3 which will be upgraded to newer version in future.\n\n'
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
