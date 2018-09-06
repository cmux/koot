// 初始化环境变量
// require('../../utils/init-node-env')()

// 处理 es6\es7
// require('babel-core/register')
// require('babel-polyfill')

// 前后端同构使用统一的 fetch 数据方式
require('isomorphic-fetch')

// 告诉配置文件，当前运行环境不是webpack
// /config/apps/ 这里的server属性用到的
global.NOT_WEBPACK_RUN = true

// 

const fs = require('fs-extra')
const getPathnameDevServerStart = require('../../utils/get-pathname-dev-server-start')

//

import App from './app'

import kootServer from './run'
import {
    name,
    // dir,
    template,
    router,
    redux,
    client,
    server,
} from '__KOOT_PROJECT_CONFIG_PATHNAME__'
// } from '../../../../koot'

const {
    cookieKeys,
} = server

// 设置服务器端口
if (typeof process.env.SERVER_PORT === 'undefined' && typeof __SERVER_PORT__ !== 'undefined')
    process.env.SERVER_PORT = __SERVER_PORT__
const port = process.env.SERVER_PORT
// console.log('process.env.SERVER_PORT', process.env.SERVER_PORT)
// console.log('__SERVER_PORT__', __SERVER_PORT__)
// console.log('port', port)

// const serverConfig = require('../config/system')
const appObj = new App()
const app = appObj.instance()

/* 公用的koa配置 */
app.keys = cookieKeys || 'koot';

(async () => {
    await kootServer(app, {
        name,
        // dir,
        template,
        router,
        redux,
        client,
        server,
    })
})();

/* 系统运行 */
appObj.run(port)

setTimeout(() => {
    if (__DEV__) {
        console.log(`\x1b[32m√\x1b[0m ` + `\x1b[93m[koot/server]\x1b[0m started on \x1b[32m${'http://localhost:' + port}\x1b[0m`)
        fs.writeFileSync(
            getPathnameDevServerStart(),
            ' ',
            'utf-8'
        )
    } else {
        console.log(`\x1b[32m√\x1b[0m ` + `\x1b[93m[koot/server]\x1b[0m listening port \x1b[32m${port}\x1b[0m`)
    }
    console.log(' ')
})
