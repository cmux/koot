const DEFAULT_PORT = 3000
const DEFAULT_SUB_APP_KEY = 'www'

export default class AppContainer {

    constructor() {

        // 存放子应用的键值对

        this.subApps = {}

        // 实例化1个 Koa 对象

        this.app = ((Koa) => new Koa())(require('koa'))

        this.mountSwitchSubAppMiddleware()

    }

    /**
     * 挂载子应用，一般是跟进二级域名前缀区分的
     * 二级域名前缀作为key
     * 
     * @param {string} key 
     * @param {Koa Object} app 
     * @memberof AppContainer
     */
    addSubApp(key, app) {

        if (this.subApps[key]) {
            console.warn(`This app key is exist : ${key} , it will be overwrite.`)
        }

        this.subApps[key] = app
    }

    removeSubApp(key) {
        this.subApps[key] = undefined
    }

    /**
     * 根据二级域名去执行不同的子 App 逻辑
     * 
     * @memberof AppContainer
     */
    mountSwitchSubAppMiddleware() {

        const compose = require('koa-compose')

        this.app.use(async function(ctx) {

            let subAppKey = ctx.hostname.split('.')[0]

            const defaultSubAppKey = process.env.DEFAULT_SUB_APP_KEY || DEFAULT_SUB_APP_KEY

            // 开发模式可以把以IP访问，默认指向www

            if (__DEV__ && ((subAppKey * 0 === 0) || ctx.hostname === 'localhost')) {
                subAppKey = defaultSubAppKey
            }

            // 把子应用的逻辑部分合并过来

            let subApp = this.subApps[subAppKey]
            if (subApp) {
                await compose(subApp.middleware)(ctx)
            } else {
                ctx.redirect(`${ctx.protocol}://${defaultSubAppKey}.${ctx.host}${ctx.path}${ctx.search}`)
            }

        })
    }


    run(port = DEFAULT_PORT) {
        const http = require('http')

        this.httpServer = http.createServer(this.app.callback())
        this.httpServer.listen(port)
    }
}