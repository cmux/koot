const fs = require('fs-extra')
const path = require('path')
const isUrl = require('is-url')

const getFilePath = require('./get-client-file-path')
const generateFilemap = require('./generate-filemap-from-compilation')
const getDistPath = require('./get-dist-path')
const getPort = require('./get-port')
const getDirDistPublic = require('../libs/get-dir-dist-public')

/**
 * 读取目标客户端打包结果文件的内容
 * @param {String} filename 要查找的文件的文件名。根据打包文件对应表 (chunkmap) 查询文件名和实际打包结果文件的对应关系
 * @param {String} [localeId] 当前语言
 * @param {Object} [compilation] Webpack compilation 对象
 * @param {Boolean} [isPathname=false] 如果标记为 true，表示提供的 filename 为确切的访问地址，无需查询对照表，直接返回结果
 * @returns {String} 文件内容
 */
const readClientFile = (filename, localeId, compilation, isPathname = false) => {
    // 如果第一个参数为 true，表示标记为 pathname
    if (filename === true) return readClientFile(localeId, compilation || undefined, isPathname || undefined, true)

    // 如果提供了 webpack compilation 数据，尝试从其中查询对应文件的最终内容并返回
    if (typeof compilation === 'object') {
        const filemap = generateFilemap(compilation)
        if (typeof filemap === 'object') {
            // console.log('\n' + filename)
            // console.log(`typeof filemap["${filename}"]`, typeof filemap[filename])
            // console.log(`typeof compilation.assets["${filemap[filename]}"]`, typeof compilation.assets[filemap[filename]])
            // for (let key in compilation) {
            //     console.log(key)
            // }

            if (typeof filemap[filename] === 'string' &&
                typeof compilation.assets[filemap[filename]] !== 'undefined'
            ) {
                const asset = compilation.assets[filemap[filename]]
                // console.log(filename, filemap[filename])
                // if (!asset._value) {
                //     console.log(asset)
                // }
                // console.log('typeof asset.source', typeof asset.source)
                if (typeof asset.source === 'function') return asset.source()
                if (typeof asset._value !== 'undefined') return asset._value
                if (typeof asset._cachedSource !== 'undefined') return asset._cachedSource
                // return '123'
            }
        }
    }

    const pathname = getFilePath(filename, localeId, isPathname)
    if (isUrl(pathname)) {
        if (__DEV__) {
            const syncRequest = require('sync-request')
            // console.log(`${pathname} is URL`)
            return syncRequest('GET', pathname, {}).getBody()
        } else {
            return `<!-- The pathname for file '${filename}' is a URL. Rendering file content from URL can only be done in DEV mode. -->`
        }
    }

    if (process.env.WEBPACK_BUILD_TYPE === 'spa' && process.env.WEBPACK_BUILD_ENV === 'dev') {
        return `<!-- http://localhost:${getPort()}${pathname} -->`
        // const syncRequest = require('sync-request')
        // return syncRequest('GET', `http://localhost:${getPort()}${pathname}`, {}).getBody()
    }

    return fs.readFileSync(
        path.resolve(
            getDirDistPublic(getDistPath()),
            getFilePath(filename, localeId, isPathname).replace(/^\//, '')
        ),
        'utf-8'
    )
}

module.exports = readClientFile
