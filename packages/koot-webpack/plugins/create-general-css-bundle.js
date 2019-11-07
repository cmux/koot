const isHotUpdate = require('../libs/is-compilation-hot-update-only');
const newCompilationFileDependency = require('../libs/new-compilation-file-dependency');
const md5 = require('md5');
const postcss = require('postcss');
const Chunk = require('webpack/lib/Chunk');
const {
    chunkNameExtractCss,
    chunkNameExtractCssForImport
} = require('koot/defaults/before-build');
const postcssTransformDeclUrls = require('../postcss/transform-decl-urls');

/**
 * Webpack 插件 - 将抽取的 CSS 文件整合为一个文件，并修改 chunkmap
 */
class CreateGeneralCssBundlePlugin {
    apply(compiler) {
        compiler.hooks.emit.tapAsync.bind(
            compiler.hooks.emit,
            'CreateGeneralCssBundlePlugin'
        )(async (compilation, callback) => {
            const stats = compilation.getStats();

            // 如果本次为热更新，不执行后续流程
            if (isHotUpdate(compilation.getStats())) return callback();

            const assets = compilation.assets;

            /** @type {Array} 已打包输出的 CSS 文件 */
            const cssFiles = [];

            for (const chunkId in stats.compilation.chunks) {
                const chunk = stats.compilation.chunks[chunkId];
                if (Array.isArray(chunk.files)) {
                    chunk.files
                        .filter(filename => /\.css$/i.test(filename))
                        .forEach(filename => {
                            cssFiles.push(filename);
                        });
                }
            }

            // 拼接抽出的 CSS 文件的内容
            const content =
                Array.isArray(cssFiles) && cssFiles.length
                    ? cssFiles
                          .filter(filename => !!assets[filename])
                          .map(filename => {
                              const asset = assets[filename];
                              if (typeof asset.source === 'function')
                                  return asset.source();
                              if (typeof asset._value !== 'undefined')
                                  return asset._value;
                              if (typeof asset._cachedSource !== 'undefined')
                                  return asset._cachedSource;
                              return '';
                          })
                          .join('\n\n')
                    : '';

            const filename = `extract.all.${md5(content)}.css`;

            // 添加 chunk
            const chunk = new Chunk(chunkNameExtractCss);
            const id = compilation.chunks.length;
            chunk.files = [filename];
            chunk.id = id;
            chunk.ids = [id];
            compilation.chunks.push(chunk);

            // 写入 Webpack 文件流
            newCompilationFileDependency(compilation, filename, content);

            // 针对 SPA 类型: 输出额外的版本，其内的资源引用相对路径不会包含 publicPath
            if (process.env.WEBPACK_BUILD_TYPE === 'spa') {
                const thisFilename = `extract.all.${md5(
                    content
                )}.url-no-public-path.css`;

                // 添加 chunk
                const chunk = new Chunk(chunkNameExtractCssForImport);
                const id = compilation.chunks.length;
                chunk.files = [thisFilename];
                chunk.id = id;
                chunk.ids = [id];
                compilation.chunks.push(chunk);

                const root = postcss.parse(content);
                postcssTransformDeclUrls(root, {
                    transformer: url =>
                        url.replace(
                            new RegExp(
                                `^${stats.compilation.outputOptions.publicPath}`,
                                'g'
                            ),
                            ''
                        )
                });

                // 写入 Webpack 文件流
                newCompilationFileDependency(
                    compilation,
                    thisFilename,
                    root.toString()
                );
            }

            return callback();
        });
    }
}

module.exports = CreateGeneralCssBundlePlugin;
