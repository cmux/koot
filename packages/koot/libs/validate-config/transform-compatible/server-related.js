/**
 * 配置转换 - 兼容性处理 - 服务器端相关选项
 * - port
 * - renderCache
 * - proxyRequestOrigin
 * - koaStatic
 * - serverBefore
 * - serverAfter
 * - serverOnRender
 * @async
 * @param {Object} config
 * @void
 */
module.exports = async (config) => {

    if (typeof config.port === 'string' || typeof config.port === 'number') {
        if (!config.devPort)
            config.devPort = config.port
    } else if (typeof config.port === 'object') {
        config.devPort = config.port.dev
        config.port = config.port.prod
    }

    const transform = (key, keyInServer) => {
        if (typeof config[key] !== 'undefined' && typeof config.server === 'object') {
            delete config.server[keyInServer]
        } else if (typeof config.server === 'object') {
            config[key] = config.server[keyInServer]
            delete config.server[keyInServer]
        }
    }

    const keys = [
        ['renderCache', 'renderCache'],
        ['proxyRequestOrigin', 'proxyRequestOrigin'],
        ['koaStatic', 'koaStatic'],
        ['serverBefore', 'before'],
        ['serverAfter', 'after'],
        ['serverOnRender', 'onRender'],
    ]

    keys.forEach(([key, keyInServer]) => transform(key, keyInServer))

}
