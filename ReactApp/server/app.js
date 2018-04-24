const DEFAULT_PORT = 3000

const debug = require('debug')
const warn = debug('SYSTEM:warn')
const info = debug('SYSTEM:info')
const error = debug('SYSTEM:error')

export default class AppContainer {

    app = null
    httpServer = null

    constructor() {
        // 实例化1个 Koa 对象
        this.app = ((Koa) => new Koa())(require('koa'))
    }

    run(port = DEFAULT_PORT) {

        const http = require('http')
        const server = this.httpServer = http.createServer(this.app.callback())

        // http 服务监听

        server.on('error', onError)
        server.on('listening', onListening)

        function onError(err) {

            if (err.syscall !== 'listen') {
                throw err
            }

            // handle specific listen errors with friendly messages
            switch (err.code) {
                case 'EACCES':
                    error(port + ' requires elevated privileges !!!')
                    process.exit(1)
                    break
                case 'EADDRINUSE':
                    error(port + ' is already in use !!!')
                    process.exit(1)
                    break
                default:
                    throw err
            }
        }

        function onListening() {
            info(`SYSTEM listening on ${port} √ `)
        }

        server.listen(port)
    }
}