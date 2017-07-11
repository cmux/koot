import responseTime from 'koa-response-time'
import AppContainer from '../core/AppContainer'

const serverConfig = require('../config/server')

const server = new AppContainer()

/* 公用的koa配置 */

server.app.keys = ['super-project-key']
server.app.use(responseTime())

/* 挂载子应用 */

server.addSubApp('www', require('../apps/www'))
server.addSubApp('react', require('../apps/react'))
// server.addSubApp('react1', require('../apps/react1'))
server.mountSwitchSubAppMiddleware(serverConfig.DEFAULT_SUB_APP_KEY)

/* 系统运行 */

server.run(serverConfig.SERVER_PORT)