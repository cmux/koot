const writeChunkmap = require('../../../utils/write-chunkmap')

class GenerateChunkmap {
    constructor(settings = {}) {
        this.localeId = settings.localeId
    }

    apply(compiler) {
        const localeId = this.localeId
        const TYPE = process.env.WEBPACK_BUILD_TYPE

        // hook: afterEmit
        // 写入 chunkmap
        compiler.hooks.afterEmit.tapAsync.bind(compiler.hooks.afterEmit, 'GenerateChunkmap')(async (compilation, callback) => {
            if (TYPE !== 'spa') await writeChunkmap(compilation.getStats(), localeId)
            callback()
        })
    }
}

module.exports = GenerateChunkmap
