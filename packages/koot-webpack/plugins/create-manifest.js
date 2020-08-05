const md5 = require('md5');
const isHotUpdate = require('../libs/is-compilation-hot-update-only');
const newCompilationChunk = require('../libs/new-compilation-chunk');
const newCompilationFileDependency = require('../libs/new-compilation-file-dependency');
const favicons = require('favicons');

const { compilationKeyHtmlMetaTags } = require('koot/defaults/before-build');

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

            // TODO 分析 EJS 模板，取出必要的信息

            // TODO 修改 EJS 模板，将部分 meta 标签删除

            // const res = await new Promise((resolve, reject) => {
            //     favicons(
            //         file,
            //         {
            //             path: folder,
            //         },
            //         (err, res) => {
            //             if (err) return reject(err);
            //             resolve(res);
            //         }
            //     );
            // });
            // console.log(res);

            // TODO 写入图标、图片文件

            // TODO 写入其他文件，每个文件都采用 md5 文件名

            const manifest = { icons };
            const filename = `manifest.${md5(manifest)}.json`;

            // 添加 chunk
            newCompilationChunk(compilation, filename);

            // 写入 Webpack 文件流
            newCompilationFileDependency(
                compilation,
                filename,
                JSON.stringify(manifest, undefined, 4)
            );

            // 添加信息到 compilation
            compilation[compilationKeyHtmlMetaTags] = '<!-- TEST -->';

            return callback();
        });
    }
}

module.exports = KootCreateManifestPlugin;
