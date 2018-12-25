import * as portionConfig from '__KOOT_PROJECT_CONFIG_PORTION_PATHNAME__'

import validateReduxConfig from '../../React/validate/redux-config'
window.__KOOT_STORE__ = ((reduxConfig = {}) => {
    if (typeof reduxConfig.factoryStore === 'function')
        return reduxConfig.factoryStore()
    if (typeof reduxConfig.store === 'object')
        return reduxConfig.store
    return {}
})(validateReduxConfig(portionConfig.redux))

import History from '../../React/history'
window.__KOOT_HISTORY__ = History
