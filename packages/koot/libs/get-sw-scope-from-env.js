/* eslint-disable no-restricted-globals */

import { scopeNeedTransformPathname } from '../defaults/defines-service-worker.js';

/**
 * 基于环境变量，获取 service worker 的 scope
 * @param {string} [scope]
 * @returns {string} scope 路径名，前后都有 `/`
 */
const getSwScopeFromEnv = (valueScope) => {
    let scope = valueScope;
    if (!scope)
        try {
            scope = JSON.parse(process.env.KOOT_PWA_SCOPE) || '/';
        } catch (e) {
            scope = '/';
        }

    if (scope === scopeNeedTransformPathname) {
        scope =
            typeof window !== 'undefined'
                ? window.location.pathname
                : typeof location !== 'undefined'
                ? location.pathname
                : scopeNeedTransformPathname;
    }

    if (scope !== scopeNeedTransformPathname) {
        // 确保前后都有 `/`
        scope = /^\//.test(scope) ? scope : `/${scope}`;
        scope = /\/$/.test(scope) ? scope : `${scope}/`;
    }

    return scope;
};

export default getSwScopeFromEnv;
