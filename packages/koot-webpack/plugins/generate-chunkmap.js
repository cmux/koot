const { Compilation } = require('webpack');

const {
    buildManifestFilename,
    buildOutputsFilename,
} = require('koot/defaults/before-build');
const writeChunkmap = require('koot/utils/write-chunkmap');

const isHotUpdate = require('../libs/is-compilation-hot-update-only');
const compilationEmitAsset = require('../libs/compilation-emit-asset');

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

            // if (TYPE !== 'spa')
            await writeChunkmap(
                compilation,
                localeId,
                outputPath,
                serviceWorkerPathname
            );

            callback();
        });

        // asset 占位
        if (TYPE === 'spa')
            compiler.hooks.thisCompilation.tap(
                'GenerateChunkmap',
                (compilation) => {
                    compilation.hooks.processAssets.tapAsync(
                        {
                            name: 'GenerateChunkmap',
                            stage:
                                Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE,
                        },
                        (compilationAssets, callback) => {
                            compilationEmitAsset(
                                compilation,
                                buildManifestFilename,
                                ``
                            );
                            compilationEmitAsset(
                                compilation,
                                buildOutputsFilename,
                                ``
                            );
                            callback();
                        }
                    );
                }
            );
    }
}

module.exports = GenerateChunkmap;
