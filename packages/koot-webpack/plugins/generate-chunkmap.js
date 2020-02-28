const writeChunkmap = require('koot/utils/write-chunkmap');
const isHotUpdate = require('../libs/is-compilation-hot-update-only');

/**
 * Webpack 插件 - 生成 chunkmap 并写入到文件
 */
class GenerateChunkmap {
    constructor(settings = {}) {
        this.localeId = settings.localeId;
        this.outputPath = settings.outputPath;
        this.serviceWorkerPathname = settings.serviceWorkerPathname;
    }

    apply(compiler) {
        const localeId = this.localeId;
        const outputPath = this.outputPath;
        const serviceWorkerPathname = this.serviceWorkerPathname;

        const TYPE = process.env.WEBPACK_BUILD_TYPE;
        const STAGE = process.env.WEBPACK_BUILD_STAGE;

        if (STAGE !== 'client') return;

        // hook: afterEmit
        // 写入 chunkmap
        compiler.hooks.afterEmit.tapAsync.bind(
            compiler.hooks.afterEmit,
            'GenerateChunkmap'
        )(async (compilation, callback) => {
            const stats = compilation.getStats();

            // 如果本次为热更新，不执行后续流程
            if (isHotUpdate(stats)) return callback();

            if (TYPE !== 'spa')
                await writeChunkmap(
                    compilation,
                    localeId,
                    outputPath,
                    serviceWorkerPathname
                );

            callback();
        });
    }
}

module.exports = GenerateChunkmap;
