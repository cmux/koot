import { syncHistoryWithStore } from 'react-router-redux'
import * as portionConfig from '__KOOT_PROJECT_CONFIG_PORTION_CLIENT_PATHNAME__'
import validateReduxConfig from '../../React/validate/redux-config'
import History from '../../React/history'

window.__KOOT_STORE__ = ((reduxConfig = {}) => {
    if (typeof reduxConfig.factoryStore === 'function')
        return reduxConfig.factoryStore()
    if (typeof reduxConfig.store === 'object')
        return reduxConfig.store
    return {}
})(validateReduxConfig(portionConfig.redux))

window.__KOOT_HISTORY__ = syncHistoryWithStore(History, window.__KOOT_STORE__)
