import thunk from 'redux-thunk'
import { browserHistory } from 'react-router'
import { routerMiddleware } from 'react-router-redux'
import { routerReducer } from 'react-router-redux'

//

import clientRouter from './router'
import ReactApp from '../../../core/ReactApp/ReactApp'
import { reducer as realtimeLocationReducer, REALTIME_LOCATION_REDUCER_NAME } from './redux/realtime-location'

const ROUTER_REDUCDER_NAME = 'routing'

const reactApp = new ReactApp({ rootDom: 'root' })

//

reactApp.redux.middleware.use(thunk)
reactApp.redux.middleware.use(routerMiddleware(browserHistory))

// 

reactApp.redux.reducer.use(ROUTER_REDUCDER_NAME, routerReducer) // 路由状态扩展
reactApp.redux.reducer.use(REALTIME_LOCATION_REDUCER_NAME, realtimeLocationReducer) // 目的：新页面请求处理完成后再改变URL

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
