const getChunkmap = require('../utils/get-chunkmap')
// const getClientFilePath = require('../utils/get-client-file-path')
const readClientFile = require('../utils/read-client-file')

module.exports = (settings = {}) => {
    const {
        localeId,
        stats,
    } = settings
    const {
        WEBPACK_BUILD_ENV: ENV,
    } = process.env

    const chunkmap = ENV === 'prod' ? getChunkmap(localeId) : {}

    return {
        stylesInHead: (() => {
            if (ENV === 'prod') {
                return (Array.isArray(chunkmap.critical) ? `<style type="text/css">${readClientFile('critical.css')}</style>` : '')
            }
            if (ENV === 'dev') {
                return '<!-- TODO: -->'
            }
        })(),
        scriptsInBody: (() => {
            if (ENV === 'prod') {
                let r = `<script type="text/javascript">`
                    + `var __REDUX_STATE__ = {};`
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
                                    file.replace(/(^\.\/|^)public\//, '')
                                }" defer></script>`
                            })
                        }
                    })
                }
                return r
            }
            if (ENV === 'dev') {
                return '<!-- TODO: -->'
            }
        })()
    }
}
