const getChunkmap = require('../utils/get-chunkmap')
// const getClientFilePath = require('../utils/get-client-file-path')
const readClientFile = require('../utils/read-client-file')

module.exports = (settings = {}) => {
    const {
        WEBPACK_BUILD_ENV: ENV,
    } = process.env
    const {
        localeId,
        chunkmap = ENV === 'prod' ? getChunkmap(localeId) : undefined,
        compilation,
    } = settings

    return {
        stylesInHead: (() => {
            if (ENV === 'prod') {
                return (Array.isArray(chunkmap.critical) ? `<style type="text/css">${readClientFile('critical.css')}</style>` : '')
            }
            if (ENV === 'dev') {
                if (typeof compilation === 'object') {
                    return '<!-- TODO: -->'
                }
                return '<!-- 112233 TODO: -->'
            }
        })(),
        scriptsInBody: (() => {
            let r = `<script type="text/javascript">var __REDUX_STATE__ = {};</script>`
            if (ENV === 'prod') {
                let r = `<script type="text/javascript">`
                    + (Array.isArray(chunkmap.critical) ? readClientFile('critical.js') : '')
                    + `</script>`
                if (typeof chunkmap['.entrypoints'] === 'object') {
                    const entries = chunkmap['.entrypoints']
                    Object.keys(entries).filter(key => (
                        key !== 'critical'
                    )).forEach(key => {
                        if (Array.isArray(entries[key])) {
                            entries[key].forEach(file => {
                                r += `<script type="text/javascript" src="${
                                    file.replace(/(^\.\/|^)public\//, '')}" defer></script>`
                            })
                        }
                    })
                }
                return r
            }
            if (ENV === 'dev') {
                if (typeof chunkmap === 'object' && typeof chunkmap['.entrypoints'] === 'object') {
                    const entries = chunkmap['.entrypoints']
                    if (Array.isArray(entries.critical)) {
                        entries.critical.forEach(file => {
                            r += `<script type="text/javascript" src="/${file}"></script>`
                        })
                    }
                    Object.keys(entries).filter(key => (
                        key !== 'critical'
                    )).forEach(key => {
                        if (Array.isArray(entries[key])) {
                            entries[key].forEach(file => {
                                r += `<script type="text/javascript" src="/${file}" defer></script>`
                            })
                        }
                    })
                    return r
                }
                if (typeof compilation === 'object') {
                    return '<!-- TODO: -->'
                }
                return '<!-- TODO: -->'
            }
        })()
    }
}
