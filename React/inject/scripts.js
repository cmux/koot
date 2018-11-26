const path = require('path')

import defaultEntrypoints from '../../defaults/entrypoints'
import readClientFile from '../../utils/read-client-file'
import getClientFilePath from '../../utils/get-client-file-path'

/**
 * 注入: JavaScript 代码
 * @param {Boolean} needInjectCritical
 * @param {Object} injectCache
 * @param {Object} entrypoints
 * @param {String} reduxHtml
 * @returns {String}
 */
export default (needInjectCritical, injectCache, entrypoints, reduxHtml) => {

    const ENV = process.env.WEBPACK_BUILD_ENV

    if (typeof injectCache.scriptsInBody === 'undefined') {
        let r = ''

        // 入口: critical
        if (needInjectCritical && Array.isArray(entrypoints.critical)) {
            r += entrypoints.critical
                .filter(file => path.extname(file) === '.js')
                .map(file => {
                    if (ENV === 'dev')
                        return `<script type="text/javascript" src="${getClientFilePath(true, file)}"></script>`
                    return `<script type="text/javascript">${readClientFile(true, file)}</script>`
                })
                .join('')
        }

        // 其他默认入口
        defaultEntrypoints.forEach(key => {
            if (Array.isArray(entrypoints[key])) {
                r += entrypoints[key].map(file => {
                    // if (ENV === 'dev')
                    // return `<script type="text/javascript" src="${getClientFilePath(true, file)}" defer></script>`
                    return `<script type="text/javascript" src="${getClientFilePath(true, file)}" defer></script>`
                }).join('')
            }
        })

        // 如果设置了 PWA 自动注册 Service-Worker，在此注册
        const pwaAuto = typeof process.env.KOOT_PWA_AUTO_REGISTER === 'string'
            ? JSON.parse(process.env.KOOT_PWA_AUTO_REGISTER)
            : false
        if (pwaAuto && typeof injectCache.pathnameSW === 'string') {
            r += `<script id="__koot-pwa-register-sw" type="text/javascript">`
            if (ENV === 'prod')
                r += `if ('serviceWorker' in navigator) {`
                    + `navigator.serviceWorker.register("${injectCache.pathnameSW}",`
                    + `{scope: '/'}`
                    + `)`
                    + `.catch(err => {console.log('👩‍💻 Service Worker SUPPORTED. ERROR', err)})`
                    + `}else{console.log('👩‍💻 Service Worker not supported!')}`
            if (ENV === 'dev')
                r += `console.log('👩‍💻 No Service Worker for DEV mode.')`
            r += `</script>`
        }

        injectCache.scriptsInBody = r
    }

    return `<script type="text/javascript">${reduxHtml}</script>${injectCache.scriptsInBody}`

}
