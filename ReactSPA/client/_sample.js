// throw new Error('123')
if (__QA__) self.logHr()
if (__QA__) console.log('...SPA initialing...')
if (self.__DEBUG) self.__DEBUG('<br/>SPA INIT START')

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router, hashHistory/*, createMemoryHistory*/ } from 'react-router'
import { syncHistoryWithStore, routerReducer } from 'react-router-redux'
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'

import configs from '@webConfig/site'
import { availableLocales } from '@webConfig/i18n'
import {
    reducerLocaleId as i18nReducerLocaleId,
    reducerLocales as i18nReducerLocales,
    registerNonIsomorphic as i18nRegister
} from 'sp-i18n'

import {
    reducer as realtimeLocationReducer,
    REALTIME_LOCATION_REDUCER_NAME,
    actionUpdate,
    update as realtimeLocationUpdate
} from 'super-project/React/realtime-location'
import arrReducers from './redux/reducers.js'

import routes from './router';

import { ImportStyleRoot } from 'sp-css-import'
import { onRouterChange } from '@webUI/layout/header'

// import queryString from 'query-string'
const localforage = __CLIENT__ && configs.sessionStoreCart ? require('@webModules/localforage') : undefined
// import { localforageKey } from '@webLogic/cart/reducer'
// import { keyLastShopId } from '@webLogic/shop/reducer'
import getFile from '@webUtils/get-file'

import axios from 'axios'
// const attachFastClick = require('fastclick')



let store
let routerConfig




// if Object.assign not supported, load /client/critical-old-ie.js
new Promise((resolve, reject) => {
    if (typeof navigator !== 'undefined') {
        // 如果不是目标场景，跳转
        if (
            !__DEV__ &&
            !self.isAliPay &&
            !self.isWechat
        ) {
            location.replace('youshallnotpass.html')
            return reject()
        }
    }

    // alert('check compatibility')
    // if (self.__DEBUG) self.__DEBUG(typeof Object.assign)
    if (self.__CRITICAL_EXTRA_OLD_IE_FILENAME__
        && (
            typeof Object.assign != 'function' ||
            (!self.isIOS && self.isUC)
        )
    ) {
        if (self.__DEBUG) self.__DEBUG('LOAD EXTRA CRITICAL')
        self.importJS(self.__CRITICAL_EXTRA_OLD_IE_FILENAME__)
            .then(resolve)
        if (self.__DEBUG) self.__DEBUG('LOADED EXTRA CRITICAL')
    } else
        resolve()

}).then(() => new Promise(resolve => {
    if (__QA__) console.log('   ├─ stage confirmed')

    // fastclick
    if (
        self.isOldIOS ||
        (self.isIOS && self.isAliPay)
    ) {
        // iOS < 11
        getFile('lib-fastclick.js')
            .then(() => {
                FastClick.attach(document.body)
                resolve()
            })
    } else {
        resolve()
    }

})).then(() => new Promise(resolve => {
    if (__QA__) console.log('   ├─ fastclick bond')

    if (self.__DEBUG) self.__DEBUG('RESTORE SESSION...')
    if (localforage) {
        // 恢复session
        // const shopId = queryString.parse(location.search).shop_id || undefined
        // localforage.getItem(keyLastShopId)
        //     .then(lastShopId => {
        //         // console.log(shopId, lastShopId)
        //         if (shopId && lastShopId === shopId) {
        //             if (configs.sessionStoreCart) {
        //                 localforage.getItem(localforageKey)
        //                     .then((value) => {
        //                         // console.log(value)
        //                         self[localforageKey] = value
        //                         resolve()
        //                     })
        //             } else {
        //                 resolve()
        //             }
        //         } else {
        //             return resolve()
        //         }
        //     })
    } else {
        resolve()
    }

})).then(() => {
    if (__QA__) console.log('   ├─ session restored')

    // 设置axios默认值
    axios.defaults.timeout = configs.requestTimeout

}).then(() => {
    if (__QA__) console.log('   ├─ complete other configs')

    if (self.__DEBUG) self.__DEBUG('SPA STARTING...')
    // alert('spa start')
    const ROUTER_REDUCDER_NAME = 'routing'

    // Combine Reducers
    const reducersObject = {
        'localeId': i18nReducerLocaleId,
        'locales': i18nReducerLocales,
        [ROUTER_REDUCDER_NAME]: routerReducer,
        [REALTIME_LOCATION_REDUCER_NAME]: realtimeLocationReducer
    }
    arrReducers.forEach(arr => reducersObject[arr[0]] = arr[1])
    const reducers = combineReducers(reducersObject)
    store = compose(applyMiddleware(thunk))(createStore)(reducers)
    self.__REDUX_STORE__ = store
    if (self.__DEBUG) self.__DEBUG('Redux inited...')








    // React initialization
    // FOR ALL ------------------------------------------
    const i18nInitAction = i18nRegister(availableLocales)
    store.dispatch(i18nInitAction)

    // --------------------------------------------------
    const localeId = i18nInitAction.localeId
    store.dispatch(i18nRegister(require(`@webLocales/${localeId}.json`)))
    // store.dispatch(i18nRegister({}))
    if (self.__DEBUG) self.__DEBUG('i18n inited...')

    // console.log('state', store.getState())

    // const memoryHistory = createMemoryHistory(location)
    routerConfig = {
        // history: syncHistoryWithStore(memoryHistory, store),
        history: syncHistoryWithStore(hashHistory, store),
        routes,
        onUpdate: () => {
            onRouterChange()
            // console.log(location)
            store.dispatch(actionUpdate(location))
        }
    }
    // if (__CLIENT__) self.routerHistory = memoryHistory
    if (__CLIENT__) self.routerHistory = hashHistory

    // memoryHistory.listen(location => {
    hashHistory.listen(location => {
        store.dispatch(realtimeLocationUpdate(location))
        // console.log(location)
        // if (typeof options.browserHistoryOnUpdate === 'function') options.browserHistoryOnUpdate(location)
    })
    if (self.__DEBUG) self.__DEBUG('Router inited...')

    return true

}).then(() => {
    if (__QA__) console.log('   └─ Preparation complete. React is about to render...')
    // console.log('router', routerConfig)

    if (self.__DEBUG) self.__DEBUG('BEFORE REACT RENDER')

    @ImportStyleRoot()
    class AppWrapper extends React.Component {
        render() {
            return (
                <div>
                    {this.props.children}
                </div>
            )
        }
    }

    ReactDOM.render(
        <Provider store={store} >
            <AppWrapper>
                <Router {...routerConfig} />
            </AppWrapper>
        </Provider>,
        document.getElementById('root')
    )

    if (__QA__) console.log('🎈 SPA initialzation success!')
    if (self.__DEBUG) self.__DEBUG('SPA INITED')

}).catch(err => {
    if (self.__DEBUG) self.__DEBUG('INIT ERROR! ' + JSON.stringify(err))
})
