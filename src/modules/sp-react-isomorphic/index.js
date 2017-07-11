import React from 'react'
import { renderToString } from 'react-dom/server'
import { createMemoryHistory, RouterContext, match } from 'react-router'
import { Provider } from 'react-redux'
import { syncHistoryWithStore } from 'react-router-redux'
import { CHANGE_LANGUAGE, TELL_ME_URL } from 'sp-base/client'
import {
    actionInit as i18nActionInit,
    actionLocales as i18nActionLocales
} from 'sp-i18n'
import cookie from 'cookie'


// 客户端开发环境webpack-dev-server端口号
const argv = require('yargs').argv
const CLIENT_DEV_DEFAULT_PORT = 3001
const CLIENT_DEV_PORT = (() => {
    let port = CLIENT_DEV_DEFAULT_PORT
    if (argv.cport) port = argv.cport
    if (process.env.CPORT) port = process.env.CPORT
    return port
})()


// html扩展用的临时变量
let htmlExtends = resetHtmlExtends()
function resetHtmlExtends() {
    return {
        title: '',
        meta: []
    }
}


//

const asyncMatch = (location) => new Promise((resolve, reject) => {
    match(location, (error, redirectLocation, renderProps) => {
        if (error) {
            return reject(error)
        }

        resolve({ redirectLocation, renderProps })
    })
})


const asyncStore = async (store, renderProps) => {

    let preprocessTasks = []
    for (let component of renderProps.components) {

        // component.WrappedComponent 是redux装饰的外壳
        if (component && component.WrappedComponent && component.WrappedComponent.preprocess) {

            // 预处理异步数据的
            const preTasks = component.WrappedComponent.preprocess(store.getState(), store.dispatch)
            if (Array.isArray(preTasks)) {
                preprocessTasks = preprocessTasks.concat(preTasks)
            } else if (preTasks.then) {
                preprocessTasks.push(preTasks)
            }
        }
    }

    await Promise.all(preprocessTasks)

}

const extendHtml = (store, renderProps) => {
    for (let component of renderProps.components) {
        if (component && component.WrappedComponent && component.WrappedComponent.htmlExtends) {
            htmlExtends = resetHtmlExtends()
            component.WrappedComponent.htmlExtends(htmlExtends, store)
        }
    }
}

let _distPathName
let distFiles = {}
/**
 * 合成返回给浏览器的完整html代码
 *
 * @param {any} react渲染的html
 * @param {any} state 处理后的redux默认状态
 * @param {object} settings html模板设置
 * @returns 最终返回浏览器的html
 */
// function renderHtml(html, state, template, distPathName = 'dist', fnInjectJs, objInjection = {}) {
function renderHtml(html, state, settings = {}) {

    // 清除settings里的空或未定义项
    for (let i in settings) {
        if (typeof settings[i] === 'undefined' || settings[i] === null)
            delete settings[i]
    }

    let options = Object.assign({
        // routes: {},
        // configStore: {},
        // template: '',
        distPathName: 'dist',
        distPublicPathName: 'dist',
        injection: {}
    }, settings)

    // return template

    let { template, distPathName, distPublicPathName } = options
    let injection = Object.assign({}, options.injection)
    _distPathName = distPathName

    // 针对非开发环境，获取打包目录下的所有文件列表
    if (!distFiles[distPathName] && !__DEV__) {
        const fs = require('fs')
        const path = require('path')
        distFiles[distPathName] = fs.readdirSync(path.resolve(distPathName, 'public/client'))
    }

    function filterStyle(htmlString) {
        let styleCollectionString = htmlString.replace(/\r\n/gi, '').replace(/\n/gi, '').match(/<div id="styleCollection(.*?)>(.*?)<\/div>/gi)[0]

        // 去掉 <div id="styleCollection">...</div>
        let onlyStyle = styleCollectionString.substr(styleCollectionString.indexOf('>') + 1, styleCollectionString.length)
        onlyStyle = onlyStyle.substr(0, onlyStyle.length - 6)

        return {
            html: htmlString.replace(/\n/gi, '').replace(styleCollectionString, ''),
            styles: onlyStyle
        }
    }

    // 样式处理
    if (typeof injection.html === 'undefined' || typeof injection.component_styles === 'undefined') {
        let htmlObj = filterStyle(html)
        if (typeof injection.html === 'undefined') injection.html = htmlObj.html
        if (typeof injection.component_styles === 'undefined') injection.component_styles = htmlObj.styles
    }

    // header 的 meta 生成
    if (typeof injection.meta === 'undefined')
        injection.meta = htmlExtends.meta.map((meta) => {
            let metaStr = '<meta'
            for (var key in meta) {
                metaStr += ` ${key}="${meta[key]}"`
            }
            metaStr += '>'
            return metaStr
        }).join('')

    if (typeof injection.title === 'undefined')
        injection.title = htmlExtends.title || 'App Title'


    if (template === undefined) {
        template = `
            <!DOCTYPE html>
            <html lang="en">

            <head>
                <meta charset="UTF-8">
                <script>//inject_meta</script>
                <title><script>//inject_title</script></title>
                <script>//inject_component_styles</script>
            </head>

            <body>
                <div id="root">
                    <div><script>//inject_html</script></div>
                </div>

                <script>//inject_redux_state</script>
                <script>//inject_js</script>

            </body>

            </html>
        `
    }

    // 序列化的redux状态
    if (typeof injection.redux_state === 'undefined')
        injection.redux_state = `<script>window.__REDUX_STATE__ = ${JSON.stringify(state)};</script>`

    // 跟进环境，注入的js链接
    if (typeof injection.js === 'undefined')
        injection.js = (args) => `<script src="${args.path}/${getInjectionJsFilename('client', distPathName)}"></script>`

    if (typeof injection.pwa === 'undefined')
        injection.pwa = require('sp-pwa/injection').default
    if (typeof injection.pwa_filename === 'undefined')
        injection.pwa_filename = require('sp-pwa/injection-filename').default

    // 返回给浏览器的html
    const injection_html = injection.html
    delete injection.html

    let responseHtml = template

    for (let key in injection) {
        let value = injection[key]
        if (typeof value === 'function')
            value = value({
                path: __DEV__ ? `http://localhost:${CLIENT_DEV_PORT}/${distPublicPathName}` : `/client`,
                distPathName: distPathName,
                distFiles: distFiles[distPathName]
            })
        responseHtml = responseHtml.replace(`<script>//inject_${key}</script>`, value)
    }

    responseHtml = responseHtml.replace(`<script>//inject_html</script>`, injection_html)

    return responseHtml
}


let distJs = {}
export const getInjectionJsFilename = (name, distPathName = _distPathName) => {
    if (!distFiles[distPathName]) return name + '.js'
    if (!distJs[name]) distJs[name] = {}
    if (!distJs[name][distPathName]) {
        distJs[name][distPathName] = name + '.js'
        distFiles[distPathName].forEach((f) => {
            var regexp = new RegExp(`^${name}\.([^.]+).js$`)
            if (regexp.test(f)) distJs[name][distPathName] = f
        })
    }
    return distJs[name][distPathName]
}


// export default function (routes, configStore, template, distPathName, fnInjectJs) {
function isomorphic(options = {}) {

    console.log('xxxxxxxxx111')

    // TODO: 尝试解决闭包内存泄漏
    let { routes, configStore } = options


    return async (ctx, next) => {

        try {
            const memoryHistory = createMemoryHistory(ctx.url)
            const store = configStore(/*memoryHistory*/) // fix redux warring
            const history = syncHistoryWithStore(memoryHistory, store)
            const { redirectLocation, renderProps } = await asyncMatch({ history, routes, location: ctx.url })

            if (redirectLocation) {
                ctx.redirect(redirectLocation.pathname + redirectLocation.search)
            } else if (renderProps) {
                
                const cookies = cookie.parse(ctx.request.header.cookie || '')

                // 准备语言到store中

                // 先查看URL参数是否有语音设置
                // hl 这个参数名是参考了Instargram
                let lang = ctx.query.hl

                // 如果没有，检查cookie
                if (!lang && cookies.spLocaleId)
                    lang = cookies.spLocaleId
                // 如果没有，再看header里是否有语言设置
                if (!lang)
                    lang = ctx.header['accept-language']
                // 如没有，再用默认
                if (!lang)
                    lang = 'en'

                // TODO: 修改成统一派发 CHANGE_SERVER_DATA
                store.dispatch({ type: CHANGE_LANGUAGE, data: lang })
                store.dispatch({ type: TELL_ME_URL, data: ctx.origin })
                store.dispatch(i18nActionInit(store.getState()))
                store.dispatch(i18nActionLocales())

                // 告诉浏览器用的lang
                // ctx.set('Content-Language', lang)
                // ctx.set('Vary', 'Accept-Language, Accept-Encoding')

                // 准备预处理数据到store中
                await asyncStore(store, renderProps)

                // 从react里处理并扩展到html
                extendHtml(store, renderProps)

                ctx.body = renderHtml(
                    renderToString(
                        <Provider store={store}>
                            <RouterContext {...renderProps } />
                        </Provider>
                    ),
                    store.getState(),
                    options
                )
            } else {
                await next()
            }

        } catch (e) {
            console.error('Server-Render Error Occures: %s', e.stack)
            ctx.status = 500
            ctx.body = e.message
        }
    }
}

export default isomorphic