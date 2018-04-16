// 处理 es6\es7
// require('babel-core/register')
// require('babel-polyfill')

// 前后端同构使用统一的 fetch 数据方式
require('isomorphic-fetch')

// 告诉配置文件，当前运行环境不是webpack
// /config/apps/ 这里的server属性用到的
global.NOT_WEBPACK_RUN = true

//

import AppContainer from 'super-project/AppContainer'

import superServer from './run'
import {
    name,
    dir,
    template,
    i18n,
    locales,
    router,
    redux,
    client,
    server,
} from '../../../../super'

const {
    domain,
    port,
    cookieKeys,
} = server

// const serverConfig = require('../config/system')
const app = new AppContainer()

/* 公用的koa配置 */
app.app.keys = cookieKeys

/* 公用koa中间件 */
require('super-project/core/middleware')(app);

/* 挂载子应用 */
(async (app) => {
    // const appsConfig = await require('../config/apps')
    // for (let appName in appsConfig) {
    //     let config = appsConfig[appName]
    //     server.addSubApp(config.domain, config.server) // 、、、、、、、、、、、因为是异步的，server内容可能不全！！！
    // }
    app.addSubApp(
        domain,
        await superServer({
            name,
            dir,
            template,
            i18n,
            locales,
            router,
            redux,
            client,
            server,
        })
    ) // 、、、、、、、、、、、因为是异步的，server内容可能不全！！！
})(app)

// const appsConfig = require('../config/apps')
// for (let appName in appsConfig) {
//     let config = appsConfig[appName]
//     console.log(config)
//     server.addSubApp(config.domain, require('../apps/api/index')) 
// }

app.mountSwitchSubAppMiddleware()

/* 系统运行 */

app.run(port)
