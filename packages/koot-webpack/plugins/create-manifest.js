const md5 = require('md5');
const isHotUpdate = require('../libs/is-compilation-hot-update-only');
const newCompilationChunk = require('../libs/new-compilation-chunk');
const newCompilationFileDependency = require('../libs/new-compilation-file-dependency');
// const {
//     chunkNameExtractCss,
//     chunkNameExtractCssForImport,
//     thresholdStylesExtracted,
// } = require('koot/defaults/before-build');

/**
 * Webpack 插件 - 自动生成 manifest.json
 */
class KootCreateManifestPlugin {
    constructor(settings = {}) {
        this.settings = settings;
    }
    apply(compiler) {
        const { icons } = this.settings;

        compiler.hooks.emit.tapAsync.bind(
            compiler.hooks.emit,
            'KootCreateManifestPlugin'
        )(async (compilation, callback) => {
            // 如果本次为热更新，不执行后续流程
            if (isHotUpdate(compilation.getStats())) return callback();

            const manifest = {};
            const filename = `manifest.${md5(manifest)}.json`;

            // 添加 chunk
            newCompilationChunk(compilation, filename);

            // 写入 Webpack 文件流
            newCompilationFileDependency(
                compilation,
                filename,
                JSON.stringify(manifest, undefined, 4)
            );

            return callback();
        });
    }
}

module.exports = KootCreateManifestPlugin;
