const { typesSPA } = require('../../defaults/before-build')

/**
 * 从配置中抽取代码中引用的配置文件 (这些文件将存放到临时目录中)
 * @async
 * @param {Object} config
 * @returns {Object}
 */
module.exports = async (config) => {
    // 代码中引用的配置文件
    const tmpConfig = {
        name: config.name || '',
        type: config.type,
        template: config.template,
        router: config.routes,
        redux: (() => {
            const redux = {}

            if (config.store) redux.store = config.store
            else if (config.reducers) redux.combineReducers = config.reducers

            if (config.cookiesToStore) redux.syncCookie = config.cookiesToStore

            return redux
        })(),
        client: (() => {
            const client = {}
            if (config.historyType) client.historyType = config.historyType
            if (config.before) client.before = config.before
            if (config.after) client.after = config.after
            if (config.onRouterUpdate) client.onRouterUpdate = config.onRouterUpdate
            if (config.onHistoryUpdate) client.onHistoryUpdate = config.onHistoryUpdate
            return client
        })()
    }
    const tmpConfigPortion = {
        template: tmpConfig.template,
        redux: tmpConfig.redux
    }

    if (typesSPA.includes(config.type)) {
        if (config.templateInject) tmpConfig.inject = config.templateInject
    }
    if (process.env.WEBPACK_BUILD_STAGE === 'server') {
        tmpConfig.server = (() => {
            const server = {}
            if (config.koaStatic) server.koaStatic = config.koaStatic
            if (config.renderCache) server.renderCache = config.renderCache
            if (config.proxyRequestOrigin) server.proxyRequestOrigin = config.proxyRequestOrigin
            if (config.templateInject) server.inject = config.templateInject
            if (config.serverBefore) server.before = config.serverBefore
            if (config.serverAfter) server.after = config.serverAfter
            if (config.serverOnRender) server.onRender = config.serverOnRender
            return server
        })()
        tmpConfigPortion.server = tmpConfig.server
    }

    const optionsNeedImport = [
        'router',
        'redux.combineReducers',
        'redux.store',
        'client.before',
        'client.after',
        'client.onRouterUpdate',
        'client.onHistoryUpdate',
        'server.reducers',
        'server.inject',
        'server.before',
        'server.after',
        'server.onRender',
        'server.onRender.beforeDataToStore',
        'server.onRender.afterDataToStore',
        'inject',
    ]

    Object.keys(config).forEach(key => {

    })

    return { tmpConfig, tmpConfigPortion }
}
