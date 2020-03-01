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

const getRoute = pathname => {
    const host = (location.host || location.hostname)
        .split('.')
        .reverse()
        .slice(0, 2)
        .reverse()
        .join('.');

    let p = pathname
        ? `/${pathname.substr(0, 1) === '/' ? pathname.substr(1) : pathname}`
        : '';
    p = p.replace(/\//g, '\\/');

    const suffix = /\\\/$/.test(p) ? `(\\/|\\?.*|$)` : `(\\?.*|$)`;

    while (/\\\/$/.test(p)) {
        p = p.substr(0, p.length - 2);
    }

    return new RegExp(`^[a-z]+:\\/\\/[^\/]*?${host}[:]*[0-9]*${p}${suffix}`);
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

if (!isKootAppDevEnv) {
    precacheAndRoute([
        // precache home page
        { url: '/', revision: null },
        // from webpack build
        ...self.__WB_MANIFEST
    ]);
}

// Caching Strategy ===========================================================

const cacheRoutes = [
    getRoute(self.__koot.distClientAssetsDirName + '/'),
    ...(self.__koot.cacheFirst || []).map(p => getRoute(p)),
    getRoute('favicon.ico')
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

[
    ...(self.__koot.networkOnly || []).map(p => getRoute(p)),
    'api/'
    //
].forEach(route => {
    registerRoute(
        route,
        new workboxStrategies.NetworkOnly({ cacheName }),
        'GET'
    );
});
[
    ...(self.__koot.networkFirst || []).map(p => getRoute(p))
    //
].forEach(route => {
    registerRoute(
        route,
        new workboxStrategies.NetworkFirst({ cacheName }),
        'GET'
    );
});

// Home Page ==================================================================
registerRoute(
    ({ url }) => url.pathname === '/',
    new workboxStrategies.NetworkFirst({ cacheName }),
    'GET'
);

// Base =======================================================================
registerRoute(
    getRoute(),
    new workboxStrategies.NetworkFirst({ cacheName }),
    'GET'
);
