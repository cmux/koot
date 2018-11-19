const writeChunkmap = require('../../../utils/write-chunkmap')

class GenerateChunkmap {
    constructor(settings = {}) {
        this.localeId = settings.localeId
    }

    apply(compiler) {
        const localeId = this.localeId
        const TYPE = process.env.WEBPACK_BUILD_TYPE
        const STAGE = process.env.WEBPACK_BUILD_STAGE
        const ENV = process.env.WEBPACK_BUILD_ENV

        if (STAGE !== 'client') return

        // hook: afterEmit
        // 写入 chunkmap
        compiler.hooks.afterEmit.tapAsync.bind(compiler.hooks.afterEmit, 'GenerateChunkmap')(async (compilation, callback) => {
            const stats = compilation.getStats()

            if (ENV === 'dev') {
                if (!stats.compilation.entrypoints.has('client'))
                    return callback()

                // console.log(1)

                const chunks = stats.compilation.entrypoints.get('client').chunks
                if (!Array.isArray(chunks))
                    return callback()

                // console.log(2)
                const isHotUpdateOnly = chunks.some(chunk => {
                    const files = chunk.files
                    if (!Array.isArray(files))
                        return false
                    // console.log(files)
                    // return false
                    return files.every(filename => filename.includes('.hot-update.'))
                })

                // 如果本次为热更新ONLY，不处理
                if (isHotUpdateOnly)
                    return callback()

                // console.log(4)

                // console.log('----------')
                // console.log(files)
                // console.log('----------')
            }

            if (TYPE !== 'spa') await writeChunkmap(stats, localeId)

            callback()
        })
    }
}

module.exports = GenerateChunkmap
