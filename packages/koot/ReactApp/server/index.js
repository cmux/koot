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

import KoaApp from './class-koa-app'
import modifyKoaApp from './modify-koa-app'
import validatePort from './validate-port'

import getFreePort from '../../libs/get-free-port'
import getPathnameDevServerStart from '../../utils/get-pathname-dev-server-start'

import {
    name,
    // dir,
    template,
    router,
    redux,
    // store,
    client,
    server,
} from '__KOOT_PROJECT_CONFIG_PATHNAME__'
// } from '../../../../koot'

const {
    cookieKeys,
} = server

//

const run = async () => {
    const port = await validatePort()
    if (!port) return

    if (__DEV__) {
        // 在随机端口启用服务器
        const portFree = await getFreePort(port)
        process.env.SERVER_PORT = portFree
        process.env.SERVER_PORT_DEV_MAIN = port
    }

    // console.log('process.env.SERVER_PORT', process.env.SERVER_PORT)
    // console.log('__SERVER_PORT__', __SERVER_PORT__)
    // console.log('port', port)

    // const serverConfig = require('../config/system')
    const koaApp = new KoaApp()
    const app = koaApp.instance()

    /* 公用的koa配置 */
    app.keys = cookieKeys || 'koot';

    await modifyKoaApp(app, {
        name,
        // dir,
        template,
        router,
        redux,
        // store,
        client,
        server,
    }).catch(err => {
        console.trace(err)
    })

    if (__DEV__) {
        // 开发模式
        koaApp.run(process.env.SERVER_PORT)
        // 标记必要信息
        setTimeout(() => {
            console.log(`\x1b[32m√\x1b[0m ` + `\x1b[93m[koot/server]\x1b[0m started on \x1b[32m${'http://localhost:' + port}\x1b[0m`)
            fs.writeJsonSync(
                getPathnameDevServerStart(),
                {
                    port: process.env.SERVER_PORT_DEV_MAIN,
                    portServer: process.env.SERVER_PORT
                }
            )
            console.log(' ')
        })
    } else {
        koaApp.run(port)
        setTimeout(() => {
            console.log(`\x1b[32m√\x1b[0m ` + `\x1b[93m[koot/server]\x1b[0m listening port \x1b[32m${port}\x1b[0m`)
            console.log(' ')
        })
    }

}

run()
