// ============================================================================

workbox.setConfig({ debug: false });

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

workbox.routing.registerRoute(
    /(^|\/)api\//,
    new workbox.strategies.NetworkOnly(),
    'GET'
);
workbox.routing.registerRoute(
    /(^|\/)__DIST_CLIENT_ASSETS_DIRNAME__\//,
    new workbox.strategies.CacheFirst(),
    'GET'
);
workbox.routing.registerRoute(
    /./,
    new workbox.strategies.NetworkFirst(),
    'GET'
);
