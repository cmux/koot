import convert from 'koa-convert'
import koaStatic from 'koa-static'

import getDirDistPublic from '../../../libs/get-dir-dist-public'
import getDistPath from '../../../utils/get-dist-path'

const koaStaticDefaults = {
    maxage: 0,
    hidden: true,
    index: 'index.html',
    defer: false,
    gzip: true,
    extensions: false
}

/**
 * KOA 中间件: 静态资源
 * @param {Object} koaStaticConfig 
 * @return {Function}
 */
const staticMiddleware = (koaStaticConfig = {}) => {
    const dir = getDirDistPublic(getDistPath())
    const config = Object.assign({}, koaStaticDefaults, koaStaticConfig)
    // console.log('koa-statc', { dir, config })
    return convert(koaStatic(dir, config))
}

export default staticMiddleware
