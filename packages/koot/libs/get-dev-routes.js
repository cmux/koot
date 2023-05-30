import path from 'node:path';
import { globSync } from 'glob';

import getDirDevDll from './get-dir-dev-dll.js';

/**
 * @typedef {Object} RouteMap
 * @property {string} file - 硬盘路径
 * @property {string} route - 访问路由/pathname
 */

/**
 * _仅针对开发环境_ 获取静态文件路由，这些文件通常临时生成并保存在硬盘中
 * @return {RouteMap[]}
 */
const getDevRoutes = () => {
    if (process.env.WEBPACK_BUILD_ENV !== 'dev') return [];

    const dirDevDll = getDirDevDll();

    return globSync('**/*', {
        cwd: dirDevDll,
        dot: true,
    }).map((route) => {
        // let route = path.relative(dirDevDll, file);
        if (route.substr(0, 1) !== '/') route = '/' + route;
        return {
            file: path.resolve(dirDevDll, route),
            route,
        };
    });
};

export default getDevRoutes;
