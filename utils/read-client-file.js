const fs = require('fs-extra')
const path = require('path')
const isUrl = require('is-url')

const getFilePath = require('./get-client-file-path')
const generateFilemap = require('./generate-filemap-from-compilation')
const getDistPath = require('./get-dist-path')

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

    // 如果提供了 webpack compilation 数据，直接从其中查询对应文件的最终内容并返回
    if (typeof compilation === 'object') {
        const filemap = generateFilemap(compilation)
        if (typeof filemap === 'object') {
            // for (let key in compilation) {
            //     console.log(key)
            // }

            if (typeof filemap[filename] === 'string' &&
                typeof compilation.assets[filemap[filename]] !== 'undefined'
            ) {
                const obj = compilation.assets[filemap[filename]]
                // console.log(filename, filemap[filename])
                // if (!obj._value) {
                //     console.log(obj)
                // }
                if (typeof obj._value !== 'undefined') return obj._value
                if (typeof obj._cachedSource !== 'undefined') return obj._cachedSource
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

    return fs.readFileSync(
        path.resolve(
            getDistPath(),
            'public/',
            getFilePath(filename, localeId, isPathname).replace(/^\//, '')
        ),
        'utf-8'
    )
}

module.exports = readClientFile
