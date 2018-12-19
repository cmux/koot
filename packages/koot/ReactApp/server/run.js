// require('@babel/register')
// require('@babel/polyfill')
require('isomorphic-fetch')

const Koa = require('koa')
const fs = require('fs-extra')
// const debug = require('debug')('Koot/Server')

import { server as serverConfig } from '__KOOT_PROJECT_CONFIG_SERVER_PATHNAME__'

import getPathnameDevServerStart from '../../utils/get-pathname-dev-server-start'

import errorMsg from '../../libs/error-msg'
import log from '../../libs/log'

import validatePort from './validate/port'

import middlewareRouterDev from './middlewares/router-dev'
import middlewareIsomorphic from './middlewares/isomorphic'
import middlewareStatic from './middlewares/static'


//


/**
 * 启动同构服务器 (KOA)
 * @async
 */
const startKootIsomorphicServer = async () => {

    console.log(`\r\n  \x1b[93m[koot/server]\x1b[0m initializing...`)
    const {
        before: serverBefore,
        after: serverAfter,
    } = serverConfig

    // 决定服务器启动端口
    // 如果端口不可用，取消启动流程
    /** @type {Number} 服务器启动端口 */
    const port = await validatePort()
    if (!port) throw new Error(errorMsg('VALIDATE_PORT', 'unavailable'))

    // 创建 Koa 实例 (app)
    /** @type {Koa} Koa 服务器实例 */
    const app = new Koa()

    // 生命周期: 服务器启动前
    if (__DEV__) log('callback', 'server', `callback: \x1b[32m${'before'}\x1b[0m(app)`)
    if (typeof serverBefore === 'function')
        await serverBefore(app)

    // [开发模式] 挂载中间件: 主服务器代理
    if (__DEV__) app.use(middlewareRouterDev)

    // 挂载中间件: 静态资源访问
    app.use(middlewareStatic(
        (() => {
            if (typeof serverConfig.koaStatic === 'object')
                return serverConfig.koaStatic
            if (typeof serverConfig.static === 'object')
                return serverConfig.static
            return {}
        })()
    ))

    // 挂载中间件: 同构服务器
    app.use(middlewareIsomorphic())

    // 生命周期: 服务器即将启动
    if (__DEV__) log('callback', 'server', `callback: \x1b[32m${'after'}\x1b[0m(app)`)
    if (typeof serverAfter === 'function')
        await serverAfter(app)

    // 初始化完成，准备启动服务器
    log(' ', 'server', `init \x1b[32m${'OK'}\x1b[0m!`)

    // 启动服务器
    await new Promise(resolve => {
        if (__DEV__) {
            app.listen(process.env.SERVER_PORT)
            // 修改 flag 文件
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
                return resolve()
            })
        } else {
            app.listen(port)
            setTimeout(() => {
                console.log(`\x1b[32m√\x1b[0m ` + `\x1b[93m[koot/server]\x1b[0m listening port \x1b[32m${port}\x1b[0m`)
                console.log(' ')
                return resolve()
            })
        }
    }).catch(err => {
        if (err instanceof Error)
            err.message = errorMsg('KOA_APP_LAUNCH', err.message)
        throw err
    })

}

export default startKootIsomorphicServer

startKootIsomorphicServer().catch(err => {
    console.error(err)
})
