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

    let entrypoints
    if (typeof chunkmap === 'object') {
        if (typeof chunkmap[localeId] === 'object' && typeof chunkmap[localeId]['.entrypoints'] === 'object') {
            entrypoints = chunkmap[localeId]['.entrypoints']
        } else if (typeof chunkmap['.entrypoints'] === 'object') {
            entrypoints = chunkmap['.entrypoints']
        }
    }

    const getContent = (filename) => {
        if (typeof compilation === 'object' && typeof compilation.assets === 'object') {
            console.log(chunkmap)
            for (let key in compilation.assets) {
                console.log(key)
            }
        }
        return readClientFile(filename, localeId)
    }

    return {
        stylesInHead: (() => {
            if (ENV === 'prod') {
                return (Array.isArray(chunkmap.critical) ? `<style type="text/css">${readClientFile('critical.css', localeId, compilation)}</style>` : '')
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
                    + (Array.isArray(chunkmap.critical) ? readClientFile('critical.js', localeId, compilation) : '')
                    + `</script>`
                if (typeof entrypoints === 'object') {
                    Object.keys(entrypoints).filter(key => (
                        key !== 'critical'
                    )).forEach(key => {
                        if (Array.isArray(entrypoints[key])) {
                            entrypoints[key].forEach(file => {
                                r += `<script type="text/javascript" src="${
                                    file.replace(/(^\.\/|^)public\//, '')}" defer></script>`
                            })
                        }
                    })
                }
                return r
            }
            if (ENV === 'dev') {
                if (typeof entrypoints === 'object') {
                    if (Array.isArray(entrypoints.critical)) {
                        entrypoints.critical.forEach(file => {
                            r += `<script type="text/javascript" src="/${file}"></script>`
                        })
                    }
                    Object.keys(entrypoints).filter(key => (
                        key !== 'critical'
                    )).forEach(key => {
                        if (Array.isArray(entrypoints[key])) {
                            entrypoints[key].forEach(file => {
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
