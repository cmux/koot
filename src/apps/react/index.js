import cookie from 'cookie'

//

import { reactApp } from './client'
import { template } from './html'
import { CHANGE_LANGUAGE, TELL_CLIENT_URL, SERVER_REDUCER_NAME, serverReducer } from './server-redux'
import isomorphicTool from '../../functions/isomorphic-tool'

// 

const Koa = require('koa')
const app = new Koa()

/* 扩展服务端特色处理的redux */

reactApp.redux.reducer.use(SERVER_REDUCER_NAME, serverReducer)

/* 同构配置 */

const isomorphic = reactApp.isomorphic.createKoaMiddleware({

    // react-router 配置对象
    routes: reactApp.react.router.get(),

    // redux store 对象
    configStore: reactApp.createConfigureStoreFactory(),

    // HTML基础模板
    template: template,

    // 对HTML基础模板的自定义注入
    // 例如：<script>//inject_critical</script>  替换为 critical
    inject: {
        // js: (args) => `<script src="${args.path}/client.js"></script>`,
        js: (() => {
            let distClientfiles = isomorphicTool.readFilesInPath('./dist/public/client') // TODO: 这里的文件名和路径是从webpack的配置里读出来的
            let reactClientJs = isomorphicTool.filterTargetFile(distClientfiles, 'react-client', 'js')
            return [`/client/${reactClientJs}`]
        })(),
        css: []
    },

    onServerRender: (obj) => {
        let { koaCtx, reduxStore } = obj

        let lang = (() => {

            // 先查看URL参数是否有语音设置
            // hl 这个参数名是参考了Instargram
            let lang = koaCtx.query.hl

            // 如果没有，检查cookie
            const cookies = cookie.parse(koaCtx.request.header.cookie || '')
            if (!lang && cookies.spLocaleId)
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
        reduxStore.dispatch({ type: TELL_CLIENT_URL, data: koaCtx.origin })

    }
})

app.use(isomorphic)


module.exports = app