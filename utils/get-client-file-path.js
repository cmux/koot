const fs = require('fs-extra')
const path = require('path')

const getPublicPath = require('./get-public-dir')
const getChunkmap = require('./get-chunkmap')


/**
 * 找到指定文件，返回路径
 * 
 * @param {string} filename 要查找的文件的文件名
 * @param {string} localeId 当前语言
 * @memberof ReactIsomorphic
 * @returns {string} 文件路径或空
 */
const getFilePath = (filename, localeId) => {
    if (typeof localeId === 'undefined') {
        try {
            localeId = require('super-project/i18n').localeId
        } catch (e) { }
    }

    const pathPublic = getPublicPath()

    const i18nType = JSON.parse(process.env.SUPER_I18N)
        ? JSON.parse(process.env.SUPER_I18N_TYPE)
        : undefined
    const isI18nDefault = (i18nType === 'default')
    // const localeId = 'zh'

    if (process.env.WEBPACK_BUILD_ENV === 'dev' || (typeof __DEV__ !== 'undefined' && __DEV__))
        return pathPublic + (isI18nDefault ? localeId : '') + `.${filename}`

    const chunkmap = getChunkmap(localeId)

    if (typeof chunkmap === 'object') {
        const extname = path.extname(filename)
        const key = path.basename(filename, extname)
        let result
        if (Array.isArray(chunkmap[key])) {
            chunkmap[key].some(value => {
                if (path.extname(value) === extname) {
                    result = value
                    return true
                }
                return false
            })
        }
        if (result)
            return `${pathPublic}${result.replace(/(^\.\/|^)public\//, '')}`
    }

    // 如果没有找到 chunkmap 或是 chunkmap 中未找到目标项目，转为过滤文件形式
    if (fs.existsSync(path.resolve(
        pathPublic,
        filename
    ))) {
        return '/' + filename
    }

    console.warn(`File not found:` + (isI18nDefault ? `[${localeId}] ` : '') + ` ${filename}`)

    return ''

    // const segs = pathname.split('/').filter(seg => seg !== '/')
    // const file = segs.pop()
    // const dir = segs.length ? `${segs.join('/')}/` : ''
    // return `/${dir}${
    //     require('./filterTargetFile')(
    //         require('./readFilesInPath')(`./${distPathname}/public/${appName ? `${appName}/` : ''}${dir}`),
    //         file
    //     )}`
}

module.exports = getFilePath
// module.exports = (pathname, pathDist = 'dist') => {
//     if (__DEV__) {
//         return `http://localhost:${process.env.WEBPACK_DEV_SERVER_PORT || '3001'}/dist/${pathname}`
//     } else {
//         const segs = pathname.split('/').filter(seg => seg !== '/')
//         const file = segs.pop()
//         const dir = segs.length ? `${segs.join('/')}/` : ''
//         return `/${dir}${
//             require('./filterTargetFile')(
//                 require('./readFilesInPath')(`./${pathDist}/public/${dir}`),
//                 file
//             )}`
//     }
// }
