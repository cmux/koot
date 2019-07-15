import React from 'react';
import { getCache } from 'koot';

const serverCacheStrings = {
    g: '__',
    l: '++'
};

interface CacheObject {
    __?: string;
}

const View: React.FC = () => {
    if (__CLIENT__) return null;

    const globalCache: CacheObject = getCache();
    const localeCache: CacheObject = getCache(true);

    const serverCache = {
        g: globalCache.__ || '',
        l: localeCache.__ || ''
    };

    if (!globalCache.__) globalCache.__ = serverCacheStrings.g;
    if (!localeCache.__) localeCache.__ = serverCacheStrings.l;

    return (
        <span
            id="__test-server-cache"
            data-expect-g={serverCacheStrings.g}
            data-expect-l={serverCacheStrings.l}
        >
            {serverCache.g + serverCache.l}
        </span>
    );
};

export default View;
