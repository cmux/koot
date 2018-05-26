import path from 'path'
import cookie from 'cookie'

//

import koaStatic from 'koa-static'
import convert from 'koa-convert'

//

import i18nRegister from 'super-project/i18n/register/isomorphic.server'
import i18nOnServerRender from 'super-project/i18n/onServerRender'

//

import { CHANGE_LANGUAGE, TELL_CLIENT_URL/*, SERVER_REDUCER_NAME, serverReducer*/ } from './redux'
import superClient from '../client/run'
import ReactIsomorphic from '../ReactIsomorphic'


export default async (app, {
    // name,
    template,
    i18n = JSON.parse(process.env.SUPER_I18N) || false,
    i18nType = JSON.parse(process.env.SUPER_I18N_TYPE) || false,
    locales = JSON.parse(process.env.SUPER_I18N_LOCALES),
    router,
    redux,
    client,
    server,
}) => {


    // if (__DEV__) console.log('\r\nServer initializing...')
    // else
    console.log(`\r\n  \x1b[93m[super/server]\x1b[0m initializing...`)




    // ============================================================================
    // 相关检查、赋值
    // ============================================================================
    const {
        inject,
        before,
        after,
    } = server
    const onRender = server.render || server.onRender

    if (typeof process.env.SUPER_HTML_TEMPLATE === 'string')
        template = process.env.SUPER_HTML_TEMPLATE

    if (typeof template !== 'string')
        throw new Error('Error: "template" type check fail!')

    if (template.substr(0, 2) === './') {
        template = require(`raw-loader?` + path.resolve(
            process.cwd(), template
        ))
    }

    if (typeof inject !== 'object')
        throw new Error('Error: "server.inject" type check fail!')





    // ============================================================================
    // 载入目录、相关配置、自定模块等
    // ============================================================================
    // if (__DEV__) console.log('├─ client code initializing...')
    if (__DEV__) console.log(`  \x1b[93m[super/server]\x1b[0m client code initializing...`)
    const reactApp = await superClient({
        i18n,
        router,
        redux,
        client
    })
    // if (__DEV__) console.log('├─ client code inited')
    if (__DEV__) console.log(`  \x1b[93m[super/server]\x1b[0m client code inited`)




    // ============================================================================
    // 对应client的server端处理
    // ============================================================================

    if (i18n) {
        const availableLocales = []
        const localesObj = {}
        locales.forEach(arr => {
            const [localeId, localeObj] = arr
            availableLocales.push(localeId)
            localesObj[localeId] = localeObj
        })
        // 服务器端注册多语言
        i18nRegister({
            localeIds: availableLocales,
            locales: localesObj,
            type: i18nType,
        })
    }




    // ============================================================================
    // 创建KOA实例
    // ============================================================================

    if (__DEV__)
        console.log(
            `\n\n`
            + `\x1b[36m⚑\x1b[0m `
            + `\x1b[93m[super/server]\x1b[0m `
            + `callback: \x1b[32m${'before'}\x1b[0m`
            + `(app)`
            + `\n`
        )
    if (typeof before === 'function') {
        await before(app)
    }

    /* 静态目录,用于外界访问打包好的静态文件js、css等 */
    app.use(convert(koaStatic(
        path.resolve(process.env.SUPER_DIST_DIR, './public'),
        {
            maxage: 0,
            hidden: true,
            index: 'index.html',
            defer: false,
            gzip: true,
            extensions: false
        }
    )))




    // ============================================================================
    // Webpack 打包配置
    // ============================================================================
    // await app.use(async (ctx, next) => {
    //     if (!__DEV__) __webpack_public_path__ = process.env.WEBPACK_SERVER_PUBLIC_PATH || ''
    //     await next()
    // })




    // ============================================================================
    // 同构配置
    // ============================================================================
    reactApp.isomorphic = new ReactIsomorphic()

    const isomorphic = reactApp.isomorphic.createKoaMiddleware({

        // react-router 配置对象
        routes: reactApp.react.router.get(),

        // redux store 对象
        configStore: reactApp.createConfigureStoreFactory(),

        // HTML基础模板
        template,

        // 对HTML基础模板的自定义注入
        // 例如：<script>//inject_critical</script>  替换为 critical
        inject,

        onServerRender: (obj) => {
            let { koaCtx, reduxStore } = obj

            reduxStore.dispatch({ type: TELL_CLIENT_URL, data: koaCtx.origin })

            if (i18n) {
                let lang = (() => {

                    // 先查看URL参数是否有语音设置
                    // hl 这个参数名是参考了Instargram
                    let lang = koaCtx.query.hl

                    // 如果没有，检查cookie
                    const cookies = cookie.parse(koaCtx.request.header.cookie || '')
                    if (!lang && cookies[process.env.SUPER_I18N_COOKIE_KEY] && cookies[process.env.SUPER_I18N_COOKIE_KEY] !== 'null')
                        lang = cookies[process.env.SUPER_I18N_COOKIE_KEY]

                    // 如果没有，再看header里是否有语言设置
                    if (!lang)
                        lang = koaCtx.header['accept-language']

                    // 如没有，再用默认
                    if (!lang)
                        lang = 'en'

                    return lang
                })()

                reduxStore.dispatch({ type: CHANGE_LANGUAGE, data: lang })
                i18nOnServerRender(obj)
            }

            if (__DEV__)
                console.log(
                    `\n\n`
                    + `\x1b[36m⚑\x1b[0m `
                    + `\x1b[93m[super/server]\x1b[0m `
                    + `callback: \x1b[32m${'onRender'}\x1b[0m`
                    + `(koaCtx, reduxStore)`
                    + `\n`
                )

            if (typeof onRender === 'function')
                onRender(obj)
        }
    })

    app.use(isomorphic)

    if (__DEV__)
        console.log(
            `\n\n`
            + `\x1b[36m⚑\x1b[0m `
            + `\x1b[93m[super/server]\x1b[0m `
            + `callback: \x1b[32m${'after'}\x1b[0m`
            + `(app)`
            + `\n`
        )
    if (typeof after === 'function') {
        await after(app)
    }

    // if (__DEV__) console.log('└─ ✔ Server inited.\r\n')
    // else
    console.log(`  \x1b[93m[super/server]\x1b[0m init \x1b[32m${'OK'}\x1b[0m!`)

    return app
}
