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

workbox.setConfig({ debug: false });
workbox.core.setCacheNameDetails({
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

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [].concat(self.__precacheManifest || []);
if (!isKootAppDevEnv)
    workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

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
    workbox.routing.registerRoute(
        route,
        new workbox.strategies[cacheStrategy]({ cacheName }),
        'GET'
    );
});

// Others =====================================================================

workbox.routing.registerRoute(
    getRoute('api'),
    new workbox.strategies.NetworkOnly(),
    'GET'
);
workbox.routing.registerRoute(
    getRoute(),
    new workbox.strategies.NetworkFirst({
        cacheName: self.__koot['__baseVersion_lt_0.12']
            ? 'koot-sw-cache'
            : undefined
    }),
    'GET'
);
