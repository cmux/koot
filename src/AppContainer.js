const DEFAULT_PORT = 3000
const DEFAULT_DOMAIN = 'www.abc.com'

export default class AppContainer {

    constructor() {

        // 存放子应用的键值对

        this.subApps = {}

        // 实例化1个 Koa 对象

        this.app = ((Koa) => new Koa())(require('koa'))

        // this.mountSwitchSubAppMiddleware()

    }

    /**
     * 挂载子应用，一般是跟进二级域名前缀区分的
     * 二级域名前缀作为key
     * 
     * @param {string} key 
     * @param {object} app 
     * @memberof AppContainer
     */
    addSubApp(domain, app) {

        if (this.subApps[domain]) {
            console.warn(`This app domain is exist : ${domain} , it will be overwrite.`)
        }

        console.info(`APP [${this.domain}] is mounted √`)

        this.subApps[domain] = app
    }

    removeSubApp(domain) {
        this.subApps[domain] = undefined
    }

    /**
     * 根据二级域名去执行不同的子 App 逻辑
     * 
     * @memberof AppContainer
     */
    mountSwitchSubAppMiddleware(defaultDomain = DEFAULT_DOMAIN) {

        const compose = require('koa-compose')
        const me = this

        this.app.use(async function(ctx, next) {

            let domain = ctx.hostname

            // 开发模式可以把以IP访问，默认指向 默认配置app

            if (['localhost', '127.0.0.1'].indexOf(ctx.hostname) > -1) {
                domain = defaultDomain
            }

            // 把子应用的逻辑部分合并过来

            if (JSON.stringify(me.subApps) === JSON.stringify({})) return next()

            let subApp = me.subApps[domain]
            if (subApp) {
                await compose(subApp.middleware)(ctx)
            } else {
                // ctx.redirect(`${ctx.protocol}://${defaultDomain}.${ctx.host}${ctx.path}${ctx.search}`)
                ctx.status = 404
            }

        })
    }


    run(port = DEFAULT_PORT) {
        const http = require('http')

        // 

        const server = http.createServer(this.app.callback())

        // http 服务监听

        server.on('error', onError)
        server.on('listening', onListening)

        function onError(error) {

            if (error.syscall !== 'listen') {
                throw error
            }

            // handle specific listen errors with friendly messages
            switch (error.code) {
                case 'EACCES':
                    console.error(port + ' requires elevated privileges !!!')
                    process.exit(1)
                    break
                case 'EADDRINUSE':
                    console.error(port + ' is already in use !!!')
                    process.exit(1)
                    break
                default:
                    throw error
            }
        }

        function onListening() {
            console.info(`SYSTEM listening on ${port} √ `)
        }

        //

        server.listen(port)

        //

        this.httpServer = server
    }
}