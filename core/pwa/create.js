const fs = require('fs-promise')
const path = require('path')
const glob = require('glob-promise')
// const md5File = require('md5-file')

const parseChunkmapPathname = pathname => pathname.replace(/^public\//g, '')

const parsePattern = pattern => {
    let firstCharacter = pattern.substr(0, 1)
    let isExclude = false

    if (firstCharacter === '!') {
        isExclude = true
        firstCharacter = pattern.substr(1, 1)
    }

    if (firstCharacter === '/')
        return (isExclude ? '!' : '') + pattern.substr(1)

    return pattern
}

/**
 * 创建 service-worker javascript 文件
 * 
 * @param {Object} settings - 设置
 * @param {string} [settings.outputPath=`${process.cwd()}/dist/public/`] - 输出文件目录
 * @param {string} [settings.outputFilename=`service-worker.js`] - 输出文件名
 * @param {boolean} [settings.outputFilenameHash=false] - 输出文件名中是否会加入 MD5 hash。若设为 true，输出文件名会变为 `${basename}.${md5hash}.js`
 * @param {string} [settings.customServiceWorkerPath=path.resolve(__dirname, '../service-worker/index.js')] - service-worker 文件模板
 * @param {string} [settings.globPattern=`/client/**//**`] - 利用 glob 初始化缓存文件列表（替换 service-worker 模板中的 urlsToCache 变量）
* @param {Object} [settings.globOptions={}] - glob 设置
* @param {Array} [settings.appendUrls=[]] - 手动追加缓存文件列表（追加到 service-worker 模板中的 urlsToCache 变量）
* @returns {Promise}
*/
const create = async (settings = {}) => {
    // let options = Object.assign({
    //     outputPath: process.cwd() + '/dist/public/',
    //     outputFilename: 'service-worker.js',
    //     outputFilenameHash: false,
    //     customServiceWorkerPath: path.resolve(__dirname, '../service-worker/index.js'),
    //     globPattern: '/client/**/*',
    //     globOptions: {},
    //     appendUrls: []
    // }, parseOptions(settings, ...args))
    const dist = process.env.SUPER_DIST_DIR
    const {
        pathname = '/service-worker.js',
        template = path.resolve(__dirname, './sw-template.js'),
        initialCache = '/**/*',
        initialCacheAppend = [],
        initialCacheIgonre = [],
    } = settings

    const files = ['/']
    const pathnamePolyfill = []
    const pathnameChunkmap = path.resolve(dist, './.public-chunckmap.json')
    const outputPath = path.resolve(dist, './public/')
    const outputFile = (() => {
        let _pathname = pathname
        if (pathname.substr(0, 1) === '/')
            _pathname = `.${pathname}`
        return path.resolve(outputPath, _pathname)
    })()

    const chunkmap = await fs.readJSON(pathnameChunkmap, 'utf-8')

    if (chunkmap.polyfill)
        if (Array.isArray(chunkmap.polyfill)) {
            chunkmap.polyfill.forEach(pathname => {
                pathnamePolyfill.push(parseChunkmapPathname(pathname))
            })
        } else {
            pathnamePolyfill.push(parseChunkmapPathname(chunkmap.polyfill))
        }

    const globOptions = {
        cwd: outputPath,
        root: outputPath,
        mark: true,
        nosort: true,
        ignore: [
            '/*'
        ]
            .concat(pathnamePolyfill)
            .concat(initialCacheIgonre)
            .map(pattern => parsePattern(pattern)),
    }

    // if (Array.isArray(initialCacheIgonre))
    //     initialCacheIgonre.forEach((pattern, index) => {
    //         initialCacheIgonre[index] = parsePattern(pattern)
    //     })

    return glob(parsePattern(initialCache), globOptions)
        .then(matches => matches
            .filter(_pathname => _pathname.slice(-1) !== '/')
            .filter(_pathname => {
                // ignore .map files
                if (path.extname(_pathname) === '.map') return false
                return true
            })
            .map(_pathname => `/${_pathname}`)
            .concat(initialCacheAppend)
            .forEach(_pathname => files.push(_pathname))
        )

        // 读取 service-worker 模板文件内容
        .then(() =>
            fs.readFile(template, { encoding: 'utf8' })
        )

        // 按 pathname 创建 service-worker 文件
        .then(content =>
            fs.writeFile(
                outputFile,
                content.replace(
                    '[/* APPEND URLS HERE */]',
                    JSON.stringify(files, undefined, 4)
                ),
                'utf8'
            )
        )

        // 修改 .public-chunkmap.json，添加 service-worker 文件信息
        .then(() => {
            chunkmap['service-worker'] = [
                `public${pathname}`
            ]
            return chunkmap
        })
        .then(() =>
            fs.writeFile(
                pathnameChunkmap,
                JSON.stringify(chunkmap, undefined, 4),
                'utf8'
            )
        )

        // .then(() => {
        //     if (!options.outputFilenameHash) return true

        //     const segs = options.outputFilename.split('.')
        //     const ext = segs[segs.length - 1]
        //     segs.pop()

        //     return fs.rename(
        //         outputFile,
        //         path.resolve(
        //             options.outputPath,
        //             `${segs.join('.')}.${md5File.sync(outputFile)}.${ext}`
        //         )
        //     )
        // })
        .then(() => {
            console.log(`\n\x1b[93m[super/build]\x1b[0m PWA: \x1b[32m${pathname}\x1b[0m created\n`)
        })
}

module.exports = create
