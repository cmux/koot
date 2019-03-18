const fs = require('fs-extra')
const path = require('path')

const generateFilemap = require('./generate-filemap-from-compilation')
const getChunkmapPath = require('./get-chunkmap-path')
const getDistPath = require('./get-dist-path')

const times = n => f => {
    let iter = i => {
        if (i === n) return
        f(i)
        iter(i + 1)
    }
    return iter(0)
}

const isNotSourcemap = (filename) => (
    !/\.(js|css)\.map$/i.test(filename)
)

const getFilePathname = (dirname, file) => {
    if (process.env.WEBPACK_BUILD_ENV === 'dev') return file
    return `${dirname}/${file}`
}

const log = (obj, spaceCount = 1, deep = 2) => {
    if (typeof obj === 'object') {
        let spaces = ''
        times(spaceCount)(() => {
            spaces += '    '
        })
        for (let key in obj) {
            console.log(spaces + key)
            if (spaceCount < deep)
                log(obj[key], spaceCount + 1, deep)
        }
    }
}

/**
 * 写入打包文件对应表 (chunkmap)
 * @param {*} stats 
 * @param {*} localeId 
 * @returns {Object} 打包文件对应表 (chunkmap)
 */
module.exports = async (compilation, localeId) => {
    if (typeof compilation !== 'object') return {}

    const stats = compilation.getStats().toJson()

    const chunkmap = {}
    const entryChunks = {}

    // const dirRelative = path.relative(getDistPath(), stats.compilation.outputOptions.path).replace(`\\`, '/')
    const dirRelative = path.relative(getDistPath(), stats.outputPath).replace(`\\`, '/')
    const filepathname = getChunkmapPath()
    // stats.compilation.outputOptions.path,

    fs.ensureFileSync(filepathname)

    // for (let key in stats.compilation) {
    //     console.log(key)
    // }

    // 生成入口对照表
    // if (stats.compilation.entrypoints) {
    //     stats.compilation.entrypoints.forEach((value, key) => {
    //         entryChunks[key] = []
    //         value.chunks.forEach(chunk => {
    //             if (Array.isArray(chunk.files))
    //                 chunk.files
    //                     .filter(file => isNotSourcemap(file))
    //                     .forEach(file =>
    //                         entryChunks[key].push(getFilePathname(dirRelative, file))
    //                     )
    //         })
    //     })
    //     chunkmap['.entrypoints'] = entryChunks
    // }
    if (typeof stats.entrypoints === 'object') {
        Object.keys(stats.entrypoints).forEach(key => {
            const { assets } = stats.entrypoints[key]
            if (!Array.isArray(assets)) return
            entryChunks[key] = []
            assets
                .filter(filename => isNotSourcemap(filename))
                .forEach(filename =>
                    entryChunks[key].push(getFilePathname(dirRelative, filename))
                )
        })
        chunkmap['.entrypoints'] = entryChunks
    }

    // 生成文件对照表
    chunkmap['.files'] = generateFilemap(compilation, dirRelative)

    // 生成所有入口和代码片段所输出的文件的对照表
    if (Array.isArray(stats.chunks)) {
        // console.log(stats.chunks)
        // for (let id in stats.compilation.chunks) {
        //     const o = stats.compilation.chunks[id]
        for (let id in stats.chunks) {
            const o = stats.chunks[id]
            if (typeof o.name === 'undefined' || o.name === null) continue
            chunkmap[o.name] = o.files

            if (Array.isArray(o.files))
                chunkmap[o.name] = o.files
                    .filter(filename => isNotSourcemap(filename))
                    .map(filename => getFilePathname(dirRelative, filename))
        }
    }

    let json = {}

    if (localeId) {
        json = fs.readJsonSync(filepathname)
        json[`.${localeId}`] = chunkmap
    } else {
        json = chunkmap
    }

    await fs.writeJsonSync(
        filepathname,
        json,
        {
            spaces: 4
        }
    )

    return json
}
