export default class KoaApp {
    constructor() {
        const Koa = require('koa')
        const app = new Koa()

        /* 静态目录,用于外界访问打包好的静态文件js、css等 */

        const koaStatic = require('koa-static')
        const convert = require('koa-convert')
        const rootPath = process.cwd() + '/dist/public'
        const option = {
            maxage: 0,
            hidden: true,
            index: 'index.html',
            defer: false,
            gzip: true,
            extensions: false
        }

        app.use(convert(koaStatic(rootPath, option)))



        /* 同构配置 */

        const isomorphic = ''

        app.use(isomorphic)

        
    }
}