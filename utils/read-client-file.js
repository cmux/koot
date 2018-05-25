const fs = require('fs-extra')
const path = require('path')
const getFilePath = require('./get-client-file-path')

module.exports = (filename, localeId, compilation) => {

    // 如果提供了 webpack compilation 数据，直接从其中查询对应文件的最终内容并返回
    if (typeof compilation === 'object' &&
        typeof compilation.getStats === 'function' &&
        typeof compilation.assets === 'object'
    ) {
        const stats = compilation.getStats()
        const filemap = {}

        for (let id in stats.compilation.chunks) {
            const o = stats.compilation.chunks[id]
            if (typeof o.name === 'undefined' || o.name === null) continue
            if (Array.isArray(o.files)) {
                o.files
                    .filter(filename => !/\.(js|css)\.map$/i.test(filename))
                    .forEach(filename => {
                        const extname = path.extname(filename)
                        const file = o.name + extname
                        if (typeof filemap[file] !== 'string')
                            filemap[file] = filename
                    })
            }
        }

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

    return fs.readFileSync(
        path.resolve(
            process.env.SUPER_DIST_DIR,
            'public/',
            getFilePath(filename, localeId).replace(/^\//, '')
        ),
        'utf-8'
    )
}
