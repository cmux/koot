import thunk from 'redux-thunk'
import { browserHistory } from 'react-router'
import { routerMiddleware } from 'react-router-redux'
import { routerReducer } from 'react-router-redux'

//

import clientRouter from './router'
import ReactApp from '../../../core/ReactApp/ReactApp'

const reactApp = new ReactApp({ rootDom: 'root' })

//

reactApp.redux.middleware.use(thunk)
reactApp.redux.middleware.use(routerMiddleware(browserHistory))

// 

reactApp.redux.reducer.use('routing', routerReducer)    // 路由状态扩展
// reactApp.redux.reducer.use('server', reactApp.serverReducer)    // 服务端数据扩展
// reactApp.redux.reducer.use('client', routerReducer)   // 客户端非业务功能扩展

// 

reactApp.react.router.use({
    path: '',
    // component: App, 可扩展1层component
    childRoutes: [clientRouter]
})

if (__CLIENT__) {
    const store = reactApp.run({
        browserHistoryOnUpdate: (location) => {
            // 回调: browserHistoryOnUpdate
            // 正常路由跳转时，URL发生变化后瞬间会触发，顺序在react组件读取、渲染之前
            console.log('browserHistory update', location)
        }
    })
}

export {
    reactApp
}





// import { redux, createConfigureStore, router, run } from 'sp-base/client'

// 引用：多语言相关
// import { reducerLocaleId as i18nReducerLocaleId, reducerLocales as i18nReducerLocales, register as i18nRegister } from 'sp-i18n'
// import { availableLocales } from 'Config/i18n'

// 引用：router
// import clientRouter from './router'

// 其他引用，仅针对本项目案例
// import { reducer as docsReducer } from './ui/pages/Doc.jsx'
// import { onRouterChange } from './ui/layout/Nav.jsx'



// ----------------------------------------------------------------------------
// 代码中行首的 /***/ 标记代表该行代码仅针对本项目案例
// ----------------------------------------------------------------------------


// redux middleware
// redux.use(thunk)
// redux.use(routerMiddleware(browserHistory))

// 设定项目所用的 redux reducer
// redux.reducer.use('routing', routerReducer)
// redux.reducer.use('localeId', i18nReducerLocaleId)
// redux.reducer.use('locales', i18nReducerLocales)
    /***/
// redux.reducer.use('docs', docsReducer)

// 设定项目所用的 react-router
// router.use({
//     path: '',
//     // component: App, 可扩展1层component
//     childRoutes: [clientRouter]
// })

// let __baidu_tongji_count = 0
    // 定制 react-router
// router.ext({
//     onUpdate: () => {

//         console.log('router - update ...')

//         // 统计代码第一次默认走html引入js
//         // if (!__DEV__ && __CLIENT__) {
//         //     if (__baidu_tongji_count !== 0) {
//         //         _hmt.push(['_trackPageview', window.location.pathname])
//         //     }

//         //     __baidu_tongji_count++
//         // }

//         /***/
//         // onRouterChange()
//     }
// })

// if (__SERVER__) {
//     // 载入所有多语言文件
//     let locales = {}
//     availableLocales.forEach(locale => {
//             locales[locale] = require(`Locales/${locale}.json`)
//         })
//         // 服务器端注册多语言
//     i18nRegister(availableLocales, locales)
// }

// //
// if (__CLIENT__) {
//     const store = run({
//         browserHistoryOnUpdate: (location) => {
//             // 回调: browserHistoryOnUpdate
//             // 正常路由跳转时，URL发生变化后瞬间会触发，顺序在react组件读取、渲染之前
//             console.log('browserHistory update', location)
//         }
//     })

//     // 此时已获取到创建好的 store 对象，可使用 store.getState()、store.dispatch() 等方法
//     // store.dispatch()

//     // 客户端注册多语言
//     // i18nRegister(__REDUX_STATE__)
// }

// //
// export {
//     router,
//     createConfigureStore
// }