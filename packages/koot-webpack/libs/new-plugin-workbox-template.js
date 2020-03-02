import 'regenerator-runtime/runtime';
import { setCacheNameDetails } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import * as workboxStrategies from 'workbox-strategies';

self.__WB_DISABLE_DEV_LOGS = true;

// Koot.js specific ===========================================================

if (typeof self.__koot !== 'object') {
    self.__koot = {
        env: {
            WEBPACK_BUILD_ENV: 'prod'
        }
    };
}
const isKootAppDevEnv = self.__koot.env.WEBPACK_BUILD_ENV === 'dev';

// Commons ====================================================================

const getRoute = (pathname, isNotPath) => {
    const host = (location.host || location.hostname)
        .split('.')
        .reverse()
        .slice(0, 2)
        .reverse()
        .join('.');
    const p = pathname
        ? `\\/${pathname.substr(0, 1) === '/' ? pathname.substr(1) : pathname}`
        : '';
    const suffix = isNotPath ? `\\?.*` : '\\/';

    return new RegExp(
        `^[a-z]+:\\/\\/[^\/]*?${host}[:]*[0-9]*${p}(${suffix}|$)`
    );
};

// Workbox Configuration ======================================================

// workbox.setConfig({ debug: false });
setCacheNameDetails({
    prefix: 'koot',
    suffix: self.__koot['__baseVersion_lt_0.12']
        ? 'cache'
        : `cache${self.__koot.localeId ? `-${self.__koot.localeId}` : ''}`,
    precache: self.__koot['__baseVersion_lt_0.12'] ? 'sw' : 'pre',
    runtime: self.__koot['__baseVersion_lt_0.12'] ? 'sw' : 'rt'
});

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Pre-caching ================================================================

if (!isKootAppDevEnv) precacheAndRoute(self.__WB_MANIFEST);

// Caching Strategy ===========================================================

const cacheRoutes = [
    getRoute(self.__koot.distClientAssetsDirName),
    getRoute('favicon.ico', true)
];
const cacheName = self.__koot['__baseVersion_lt_0.12']
    ? 'koot-sw-cache'
    : undefined;
const cacheStrategy = isKootAppDevEnv ? 'NetworkOnly' : 'CacheFirst';

cacheRoutes.forEach(route => {
    // console.log({ route, cacheStrategy });
    registerRoute(
        route,
        new workboxStrategies[cacheStrategy]({ cacheName }),
        'GET'
    );
});

// Others =====================================================================

registerRoute(getRoute('api'), new workboxStrategies.NetworkOnly(), 'GET');
registerRoute(
    getRoute(),
    new workboxStrategies.NetworkFirst({
        cacheName: self.__koot['__baseVersion_lt_0.12']
            ? 'koot-sw-cache'
            : undefined
    }),
    'GET'
);
