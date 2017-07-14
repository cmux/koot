// 加载全局变量
require('./system/global')

// 前后端同构使用统一的 fetch 数据方式
require('isomorphic-fetch')


import responseTime from 'koa-response-time'
import AppContainer from './core/AppContainer'

const serverConfig = require('./config/server')

export default class spServer {

    constructor() {
        this._port = false

        this.server = new AppContainer()

        /* 公用的koa配置 */

        this.server.app.keys = ['super-project-key']
        this.server.app.use(responseTime())

        this.opts = []
    }

    createApp(opt) {

        if (global.__BUILD__) {
            this.opts.push(opt)
            return this
        }

        if (opt.type === 'react-isomorphic') {

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

            app.use(opt.isomorphic)

        }


        if (opt.type === 'website') {

        }




        /* 挂载子应用 */


        // require('./__bridge')(this.server)
            /* 
            if (typeof opt.domain === 'string') {
                this.server.addSubApp(opt.domain, require(opt.path))
            } else {
                const me = this
                opt.domain.forEach((domain) => {
                    me.server.addSubApp(domain, require(opt.path))
                })
            } */

        return this

    }

    port(port) {
        this._port = port

        return this
    }

    run() {

        if (global.__BUILD__) return this

        let port = this._port || serverConfig.SERVER_PORT

        /* 系统运行 */

        this.server.mountSwitchSubAppMiddleware(serverConfig.DEFAULT_SUB_APP_KEY)
        this.server.run(port)

        return this
    }
}