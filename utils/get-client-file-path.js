const fs = require('fs-extra')
const path = require('path')

const getPublicPath = require('./get-public-dir')
const getChunkmap = require('./get-chunkmap')


/**
 * 获取浏览器环境中指定文件的访问路径
 * @param {String} filename 要查找的文件的文件名。根据打包文件对应表 (chunkmap) 查询文件名和实际打包结果文件的对应关系
 * @param {String} [localeId] 当前语言
 * @param {Boolean} [isPathname = false] 如果标记为 true，表示提供的 filename 为确切的访问地址，无需查询对照表，直接返回结果
 * @returns {String} 浏览器环境中的访问路径或空字符串
 */
const getFilePath = (filename, localeId, isPathname = false) => {
    // 如果第一个参数为 true，表示标记为 pathname
    if (filename === true) return getFilePath(localeId, isPathname || undefined, true)

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
    const isDev = (process.env.WEBPACK_BUILD_ENV === 'dev' || (typeof __DEV__ !== 'undefined' && __DEV__))
    // const localeId = 'zh'

    // 如果标记为 pathname，直接返回结果
    if (isPathname) return pathPublic + filename.replace(/(^\.\/|^)public\//, '')

    const chunkmap = getChunkmap(localeId)

    if (typeof chunkmap === 'object' &&
        typeof chunkmap['.files'] === 'object' &&
        typeof chunkmap['.files'][filename] === 'string'
    ) {
        return pathPublic + chunkmap['.files'][filename].replace(/(^\.\/|^)public\//, '')
    }

    if (isDev) return pathPublic + (isI18nDefault ? localeId : '') + `.${filename}`

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
