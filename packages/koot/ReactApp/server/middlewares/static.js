import convert from 'koa-convert';
import koaStatic from 'koa-static';

import getDirDistPublic from '../../../libs/get-dir-dist-public';
import getDistPath from '../../../utils/get-dist-path';

import koaStaticDefaults from '../../../defaults/koa-static';

/**
 * KOA 中间件: 静态资源
 * @param {Object} koaStaticConfig
 * @return {Function}
 */
const staticMiddleware = (koaStaticConfig = {}) => {
    const dir = getDirDistPublic(getDistPath());
    const config = Object.assign({}, koaStaticDefaults, koaStaticConfig);
    // console.log('koa-statc', {
    //     dir,
    //     config,
    //     koaStaticDefaults,
    //     koaStaticConfig
    // });
    return convert(koaStatic(dir, config));
};

export default staticMiddleware;
