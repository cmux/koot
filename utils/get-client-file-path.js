const fs = require('fs-extra')
const path = require('path')

const getPublicPath = require('./get-public-dir')


/**
 * 找到指定文件，返回路径
 * 
 * @param {string} filename 要查找的文件的文件名
 * @param {string} localeId 当前语言
 * @memberof ReactIsomorphic
 */
const getFilePath = (filename) => {
    const { localeId } = require('super-i18n')

    const pathDist = process.env.SUPER_DIST_DIR
    const pathPublic = getPublicPath()

    const i18nType = JSON.parse(process.env.SUPER_I18N)
        ? JSON.parse(process.env.SUPER_I18N_TYPE)
        : undefined
    // const localeId = 'zh'

    // console.log(pathDist, pathPublic)

    // if (pathDist && (
    //     fs.existsSync(path.resolve(pathDist, 'public')) || fs.existsSync(path.resolve(pathDist, 'server'))
    // ))
    //     return getFile(filename, '', appName)

    if (__DEV__)
        return pathPublic + (i18nType === 'default' ? localeId : '') + `.${filename}`

    const pathChunckmap = path.resolve(pathDist, '.public-chunckmap.json')

    if (fs.existsSync(pathChunckmap)) {
        let chunckmap = fs.readJsonSync(pathChunckmap)
        if (i18nType === 'default') chunckmap = chunckmap[`.${localeId}`] || {}

        const extname = path.extname(filename)
        const key = path.basename(filename, extname)
        let result
        if (Array.isArray(chunckmap[key])) {
            chunckmap[key].some(value => {
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

    // 如果没有找到chunckmap或是chunckmap中未找到目标项目，转为过滤文件形式
    if (fs.existsSync(path.resolve(
        pathPublic,
        filename
    ))) {
        return '/' + filename
    }

    console.warn(`File not found: [${localeId}] ${filename}`)

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
