import path from 'path'
import cookie from 'cookie'

//

import koaStatic from 'koa-static'
import convert from 'koa-convert'

//

import { register as i18nRegister } from 'sp-i18n'
import i18nOnServerRender from 'sp-i18n/onServerRender'

//

import { CHANGE_LANGUAGE, TELL_CLIENT_URL/*, SERVER_REDUCER_NAME, serverReducer*/ } from './redux'
import superClient from '../client/run'


export default async (app, {
    name,
    template,
    i18n,
    locales,
    router,
    redux,
    client,
    server,
}) => {


    if (__DEV__) console.log('\r\nServer initializing...')




    // ============================================================================
    // 相关检查、赋值
    // ============================================================================
    const {
        inject,
        before,
        after,
        render,
    } = server

    if (typeof template !== 'string')
        throw new Error('Error: "template" type check fail!')

    if (typeof inject !== 'object')
        throw new Error('Error: "server.inject" type check fail!')





    // ============================================================================
    // 载入目录、相关配置、自定模块等
    // ============================================================================
    if (__DEV__) console.log('├─ client code initializing...')
    const reactApp = await superClient({
        i18n,
        router,
        redux,
        client
    })
    if (__DEV__) console.log('├─ client code inited')




    // ============================================================================
    // 对应client的server端处理
    // ============================================================================

    if (i18n) {
        const availableLocales = []
        const localesObj = {}
        locales.forEach(o => {
            const [localeId, localeFilePath] = o
            availableLocales.push(localeId)
            localesObj[localeId] = localeFilePath
        })
        // 服务器端注册多语言
        i18nRegister(availableLocales, localesObj)
    }




    // ============================================================================
    // 创建KOA实例
    // ============================================================================

    if (typeof before === 'function') {
        await before(app)
    }

    /* 静态目录,用于外界访问打包好的静态文件js、css等 */
    app.use(convert(koaStatic(
        path.resolve(__DIST__, './public'),
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
    // 同构配置
    // ============================================================================
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
                    if (!lang && cookies.spLocaleId && cookies.spLocaleId !== 'null')
                        lang = cookies.spLocaleId

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

            if (typeof render === 'function')
                render(obj)
        }
    })

    // await app.use(async (ctx, next) => {
    //     if (!__DEV__) __webpack_server_public_path__ = `/${name}/` // TODO: 移动到配置里
    //     await next()
    // })

    app.use(isomorphic)

    if (typeof after === 'function') {
        await after(app)
    }

    if (__DEV__) console.log('└─ ✔ Server inited.\r\n')

    return app
}