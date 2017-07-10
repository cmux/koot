// import { routerReducer } from 'react-router-redux'
import { reactApp } from './client'
import { template } from './html'

// 

const Koa = require('koa')
const app = new Koa()

// test TODO:

reactApp.redux.reducer.use('server', (state = { xx: '123' }) => {
    return state
})

// reactApp.redux.reducer.use('routing', routerReducer)
// reactApp.redux.reducer.use('routing', routerReducer)    // 路由状态扩展


// 同构配置

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
        js: [
            '/dist/client.js' // TODO:
        ],
        css: []
    },

    onServerRender: (obj) => {
        let { koaCtx, reduxStore } = obj

        // reduxStore.dispatch()
    }
})

app.use(isomorphic)


module.exports = app