/* eslint-disable no-restricted-globals */

import 'regenerator-runtime/runtime';
import {
    setCacheNameDetails,
    cacheNames,
    skipWaiting,
    clientsClaim,
} from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';
import {
    registerRoute,
    // setDefaultHandler
} from 'workbox-routing';
import * as workboxStrategies from 'workbox-strategies';
// import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import sanitize from 'sanitize-filename';
import { scopeNeedTransformPathname } from 'koot/defaults/defines-service-worker';

self.__WB_DISABLE_DEV_LOGS = true;

// Koot.js specific ===========================================================

if (typeof self.__koot !== 'object') {
    self.__koot = {
        env: {
            WEBPACK_BUILD_ENV: 'prod',
        },
    };
}
if (self.__koot.scope === scopeNeedTransformPathname)
    self.__koot.scope =
        location.pathname
            .split('/')
            .slice(0, location.pathname.split('/').length - 1)
            .join('/') + '/';
const isKootAppDevEnv = self.__koot.env.WEBPACK_BUILD_ENV === 'dev';

// Commons ====================================================================

const getRoute = (pathname, addScope = false) => {
    if (typeof pathname === 'function') return pathname;

    return ({ url, request, event }) => {
        if (request.method.toUpperCase() !== 'GET') return false;
        if (url.origin !== location.origin) return false;
        if (pathname instanceof RegExp) return pathname.test(url.pathname);

        let p = pathname
            ? `${addScope ? self.__koot.scope : '/'}${
                  pathname.substr(0, 1) === '/' ? pathname.substr(1) : pathname
              }`
            : `${addScope ? self.__koot.scope : ''}`;
        p = p.replace(/\//g, '\\/');

        const suffix = !p
            ? ''
            : /\\\/$/.test(p)
            ? `(\\/|\\?.*|$)`
            : `(\\?.*|$)`;

        while (/\\\/$/.test(p)) {
            p = p.substr(0, p.length - 2);
        }

        // console.log(
        //     new RegExp(`${p}${suffix}`),
        //     url.pathname,
        //     new RegExp(`${p}${suffix}`).test(url.pathname)
        // );

        return new RegExp(`${p}${suffix}`).test(url.pathname);
    };
};

// Workbox Configuration ======================================================

setCacheNameDetails({
    prefix: 'koot',
    suffix: `cache${self.__koot.localeId ? `-${self.__koot.localeId}` : ''}${
        self.__koot.scope && self.__koot.scope !== '/'
            ? `-${sanitize(self.__koot.scope)}`
            : ''
    }`,
    precache: 'pre',
    runtime: 'rt',
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        skipWaiting();
        clientsClaim();
    }
});

// Pre-caching ================================================================

if (!isKootAppDevEnv) {
    precacheAndRoute([
        // from webpack build
        ...self.__WB_MANIFEST,
    ]);
    // add home page into `runtime` cache
    caches
        .open(cacheNames.runtime)
        .then((cache) => cache.add(self.__koot.scope || '/'));
}

// Caching Strategy ===========================================================

const cacheRoutes = [
    getRoute(self.__koot.distClientAssetsDirName + '/', true),
    ...(self.__koot.cacheFirst || []).map((p) => getRoute(p)),
    getRoute('favicon.ico', true),
];
const cacheStrategy = isKootAppDevEnv ? 'NetworkOnly' : 'CacheFirst';

cacheRoutes.forEach((route) => {
    // console.log({ route, cacheStrategy });
    registerRoute(route, new workboxStrategies[cacheStrategy](), 'GET');
});

// Others =====================================================================

[
    ...(self.__koot.networkOnly || []).map((p) => getRoute(p)),
    'api/',
    //
].forEach((route) => {
    registerRoute(route, new workboxStrategies.NetworkOnly(), 'GET');
});
[
    ...(self.__koot.networkFirst || []).map((p) => getRoute(p)),
    //
].forEach((route) => {
    registerRoute(route, new workboxStrategies.NetworkFirst(), 'GET');
});

// Default ====================================================================
registerRoute(
    getRoute(undefined, true),
    new workboxStrategies.NetworkFirst(),
    'GET'
);
