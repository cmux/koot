const path = require('path')

const defaultEntrypoints = require('../../defaults/entrypoints')
const readClientFile = require('../../utils/read-client-file')
const getClientFilePath = require('../../utils/get-client-file-path')

/**
 * 注入: JavaScript 代码
 * @param {Object} options
 * @param {Boolean} [options.needInjectCritical]
 * @param {Object} [options.injectCache]
 * @param {Object} [options.entrypoints]
 * @param {String} [options.reduxHtml]
 * @returns {String}
 */
module.exports = ({
    needInjectCritical,
    injectCache,
    entrypoints,
    reduxHtml,
    serverState = {}
}) => {

    const ENV = process.env.WEBPACK_BUILD_ENV
    const isDev = Boolean(ENV === 'dev' || (typeof __DEV__ !== 'undefined' && __DEV__))
    const isProd = !isDev

    if (isDev || typeof injectCache.scriptsInBody === 'undefined') {
        let r = ''

        // 入口: critical
        if (needInjectCritical && Array.isArray(entrypoints.critical)) {
            r += entrypoints.critical
                .filter(file => path.extname(file) === '.js')
                .map(file => {
                    if (isDev)
                        return `<script type="text/javascript" src="${getClientFilePath(true, file)}"></script>`
                    return `<script type="text/javascript">${readClientFile(true, file)}</script>`
                })
                .join('')
        }

        // 其他默认入口
        // console.log('defaultEntrypoints', defaultEntrypoints)
        // console.log('entrypoints', entrypoints)
        defaultEntrypoints.forEach(key => {
            if (Array.isArray(entrypoints[key])) {
                r += entrypoints[key]
                    .filter(file => /\.(js|jsx|mjs|ejs)$/.test(file))
                    .map(file => {
                        // console.log(file)
                        // if (isDev)
                        // return `<script type="text/javascript" src="${getClientFilePath(true, file)}" defer></script>`
                        return `<script type="text/javascript" src="${getClientFilePath(true, file)}" defer></script>`
                    })
                    .join('')
            }
        })

        // 如果设置了 PWA 自动注册 Service-Worker，在此注册
        const pwaAuto = typeof process.env.KOOT_PWA_AUTO_REGISTER === 'string'
            ? JSON.parse(process.env.KOOT_PWA_AUTO_REGISTER)
            : false
        if (pwaAuto && typeof injectCache.pathnameSW === 'string') {
            r += `<script id="__koot-pwa-register-sw" type="text/javascript">`
            if (isProd)
                r += `if ('serviceWorker' in navigator) {`
                    + `navigator.serviceWorker.register("${injectCache.pathnameSW}",`
                    + `{scope: '/'}`
                    + `)`
                    + `.catch(err => {console.log('👩‍💻 Service Worker SUPPORTED. ERROR', err)})`
                    + `}else{console.log('👩‍💻 Service Worker not supported!')}`
            if (isDev)
                r += `console.log('👩‍💻 No Service Worker for DEV mode.')`
            r += `</script>`
        }

        injectCache.scriptsInBody = r
    }

    return `<script type="text/javascript">`
        + (reduxHtml ? reduxHtml : `window.__REDUX_STATE__ = {};`)
        + (`window.LocaleId = "${serverState.localeId || ''}"`)
        + `</script>`
        + `${injectCache.scriptsInBody}`

}
