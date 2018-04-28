// 初始化环境变量
require('../../utils/init-node-env')()

// 处理 es6\es7
// require('babel-core/register')
// require('babel-polyfill')

// 前后端同构使用统一的 fetch 数据方式
require('isomorphic-fetch')

// 告诉配置文件，当前运行环境不是webpack
// /config/apps/ 这里的server属性用到的
global.NOT_WEBPACK_RUN = true

//

import App from './app'

import superServer from './run'
import {
    name,
    // dir,
    template,
    i18n,
    locales,
    router,
    redux,
    client,
    server,
} from '../../../../super'

const {
    cookieKeys,
} = server

const {
    // SERVER_DOMAIN: domain,
    SERVER_PORT: port,
} = process.env

// const serverConfig = require('../config/system')
const appObj = new App()
const app = appObj.instance()

/* 公用的koa配置 */
app.keys = cookieKeys || 'super-project'

;(async() => {
    await superServer(app, {
        name,
        // dir,
        template,
        i18n,
        locales,
        router,
        redux,
        client,
        server,
    })
})();

if (__DEV__) {
    console.log(`\r\n\x1b[93m[super/server]\x1b[0m started on ${'http://localhost:' + port}\r\n`)
} else {
    console.log(`\r\n\x1b[93m[super/server]\x1b[0m listening port ${port}\r\n`)
}

/* 系统运行 */

appObj.run(port)
