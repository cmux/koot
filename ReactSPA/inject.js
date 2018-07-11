const path = require('path')
const fs = require('fs-extra')

const defaultEntrypoints = require('../defaults/entrypoints')

const getChunkmap = require('../utils/get-chunkmap')
const readClientFile = require('../utils/read-client-file')
const getSWPathname = require('../utils/get-sw-pathname')
const getDistPath = require('../utils/get-dist-path')

const {
    __SUPER_INJECT_METAS_START__,
    __SUPER_INJECT_METAS_END__,
} = require('../defaults/defines')

module.exports = (settings = {}) => {
    const {
        WEBPACK_BUILD_ENV: ENV,
    } = process.env
    const {
        localeId,
        chunkmap = getChunkmap(localeId) || {},
        compilation,
        inject = {},
    } = settings

    const {
        '.entrypoints': entrypoints = {},
        '.files': filemap = {},
    } = chunkmap

    return Object.assign({}, {

        htmlLang: localeId ? ` lang="${localeId}"` : '',
        metas: `<!--${__SUPER_INJECT_METAS_START__}--><!--${__SUPER_INJECT_METAS_END__}-->`,
        styles: (() => {
            let r = ''
            if (typeof filemap['critical.css'] === 'string') {
                if (ENV === 'prod')
                    r += `<style id="__super-critical-styles" type="text/css">${readClientFile('critical.css', localeId, compilation)}</style>`
                if (ENV === 'dev')
                    r += `<link id="__super-critical-styles" media="all" rel="stylesheet" href="/${filemap['critical.css']}" />`
            }
            return r
        })(),

        scripts: (() => {
            let r = `<script type="text/javascript">window.__REDUX_STATE__ = {};</script>`

            if (typeof entrypoints === 'object') {
                // 优先引入 critical
                if (Array.isArray(entrypoints.critical)) {
                    entrypoints.critical
                        .filter(filename => path.extname(filename) === '.js')
                        .forEach(filename => {
                            r += ENV === 'prod'
                                ? `<script type="text/javascript">${fs.readFileSync(
                                    path.resolve(getDistPath(), filename.replace(/^\//, '')),
                                    'utf-8'
                                )}</script>`
                                : `<script type="text/javascript" src="/${filename}"></script>`
                        })
                }

                // 引入其他入口
                if (typeof entrypoints === 'object') {
                    // Object.keys(entrypoints).filter(key => (
                    //     key !== 'critical' && key !== 'polyfill'
                    // ))
                    defaultEntrypoints.forEach(key => {
                        if (Array.isArray(entrypoints[key])) {
                            entrypoints[key].forEach(file => {
                                r += ENV === 'prod'
                                    ? `<script type="text/javascript" src="${file.replace(/(^\.\/|^)public\//, '')}" defer></script>`
                                    : `<script type="text/javascript" src="/${file}" defer></script>`
                            })
                        }
                    })
                }

                // 如果设置了 PWA 自动注册 Service-Worker，在此注册
                const pwaAuto = typeof process.env.SUPER_PWA_AUTO_REGISTER === 'string'
                    ? JSON.parse(process.env.SUPER_PWA_AUTO_REGISTER)
                    : false
                const pwaPathname = getSWPathname()
                if (pwaAuto && typeof pwaPathname === 'string') {
                    r += `<script id="__super-pwa-register-sw" type="text/javascript">`
                    if (ENV === 'prod')
                        r += `if ('serviceWorker' in navigator) {`
                            + `navigator.serviceWorker.register("${pwaPathname.substr(0, 1) ? pwaPathname.substr(1) : pwaPathname}",`
                            + `{scope: '/'}`
                            + `)`
                            + `.catch(err => {console.log('👩‍💻 Service Worker SUPPORTED. ERROR', err)})`
                            + `}else{console.log('👩‍💻 Service Worker not supported!')}`
                    if (ENV === 'dev')
                        r += `console.log('👩‍💻 No Service Worker for DEV mode.')`
                    r += `</script>`
                }
            }

            return r
        })()
    }, inject)
}
