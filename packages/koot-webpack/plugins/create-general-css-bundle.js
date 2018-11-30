const getChunkMap = require('../libs/require-koot')('utils/get-chunkmap')
const getChunkMapPathname = require('../libs/require-koot')('utils/get-chunkmap-path')

/**
 * Webpack 插件 - 将抽取的 CSS 文件整合为一个文件，并修改 chunkmap
 *   - **注** 该插件需要放在生成 chunkmap 插件之后
 */
class CreateGeneralCssBundlePlugin {
    constructor(options = {}) {
        this.localeId = options.localeId
    }

    apply(compiler) {
        const {
            localeId
        } = this

        compiler.hooks.afterEmit.tapAsync.bind(compiler.hooks.afterEmit, 'CreateGeneralCssBundlePlugin')(async (compilation, callback) => {
            const chunkmap = getChunkMap(localeId)
            console.log(chunkmap)
            const cssFiles = Object.keys(chunkmap)
                // 过滤出 chunkmap 中所有 chunk 的 key
                // 即排除 .entrypoints、.files 等特殊 key
                // 特殊 key 均以 . 开头
                .filter
            return callback()
        })
    }
}

module.exports = CreateGeneralCssBundlePlugin
