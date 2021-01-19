const md5 = require('md5');
const postcss = require('postcss');
const { Compilation } = require('webpack');
// const Chunk = require('webpack/lib/Chunk');

const {
    chunkNameExtractCss,
    chunkNameExtractCssForImport,
    thresholdStylesExtracted,
} = require('koot/defaults/before-build');

const postcssTransformDeclUrls = require('../postcss/transform-decl-urls');
const isHotUpdate = require('../libs/is-compilation-hot-update-only');
const compilationEmitAsset = require('../libs/compilation-emit-asset');

/**
 * Webpack 插件 - 将抽取的 CSS 文件整合为一个文件，并修改 chunkmap
 */
class CreateGeneralCssBundlePlugin {
    constructor(settings = {}) {
        this.filenamePrefix = settings.filenamePrefix;
    }
    apply(compiler) {
        const { filenamePrefix } = this;

        compiler.hooks.thisCompilation.tap(
            'CreateGeneralCssBundlePlugin',
            (compilation) => {
                compilation.hooks.processAssets.tapAsync(
                    {
                        name: 'CreateGeneralCssBundlePlugin',
                        stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE,
                    },
                    (compilationAssets, callback) => {
                        // console.log('CreateGeneralCssBundlePlugin');

                        const stats = compilation.getStats();
                        // 如果本次为热更新，不执行后续流程
                        if (isHotUpdate(compilation.getStats()))
                            return callback();

                        const assets = compilation.assets;

                        /** @type {Array} 已打包输出的 CSS 文件 */
                        const cssFiles = [];

                        for (const chunk of stats.compilation.chunks) {
                            // const chunk = stats.compilation.chunks[chunkId];
                            try {
                                for (const file of chunk.files) {
                                    if (/\.css$/i.test(file))
                                        cssFiles.push(file);
                                }
                            } catch (e) {}
                        }

                        // 拼接抽出的 CSS 文件的内容
                        const content =
                            Array.isArray(cssFiles) && cssFiles.length
                                ? cssFiles
                                      .filter((filename) => !!assets[filename])
                                      .map((filename) => {
                                          const asset = assets[filename];
                                          if (
                                              typeof asset.source === 'function'
                                          )
                                              return asset.source();
                                          if (
                                              typeof asset._value !==
                                              'undefined'
                                          )
                                              return asset._value;
                                          if (
                                              typeof asset._cachedSource !==
                                              'undefined'
                                          )
                                              return asset._cachedSource;
                                          return '';
                                      })
                                      .join('\n\n')
                                : '';

                        const size = content.length;
                        const filename =
                            filenamePrefix +
                            `extract.all.` +
                            md5(content) +
                            (size > thresholdStylesExtracted
                                ? '.large'
                                : '.small') +
                            `.css`;

                        compilationEmitAsset(compilation, filename, content, {
                            chunkName: chunkNameExtractCss,
                        });

                        // 针对 SPA 类型: 输出额外的版本，其内的资源引用相对路径不会包含 publicPath
                        if (process.env.WEBPACK_BUILD_TYPE === 'spa') {
                            const thisFilename =
                                filenamePrefix +
                                `extract.all.` +
                                md5(content) +
                                `.url-no-public-path` +
                                (size > thresholdStylesExtracted
                                    ? '.large'
                                    : '.small') +
                                `.css`;

                            const root = postcss.parse(content);
                            postcssTransformDeclUrls(root, {
                                transformer: (url) => {
                                    let result = url.replace(
                                        new RegExp(
                                            `^${stats.compilation.outputOptions.publicPath}`,
                                            'g'
                                        ),
                                        ''
                                    );
                                    if (filenamePrefix)
                                        result = result.replace(
                                            new RegExp(`^${filenamePrefix}`),
                                            ''
                                        );
                                    return result;
                                },
                            });

                            compilationEmitAsset(
                                compilation,
                                thisFilename,
                                root.toString(),
                                {
                                    chunkName: chunkNameExtractCssForImport,
                                }
                            );
                        }
                        return callback();
                    }
                );
            }
        );

        // const compilerHook = 'make';
        // // const compilerHook = 'emit';

        // compiler.hooks[compilerHook].tap(
        //     'CreateGeneralCssBundlePlugin',
        //     (compilation) => {
        //         compilation.hooks.additionalAssets.tapPromise(
        //             'CreateGeneralCssBundlePlugin',
        //             async () => {
        //                 const stats = compilation.getStats();
        //                 const { chunkGraph } = compilation;

        //                 // 如果本次为热更新，不执行后续流程
        //                 if (isHotUpdate(compilation.getStats())) return;

        //                 const assets = compilation.assets;

        //                 /** @type {Array} 已打包输出的 CSS 文件 */
        //                 const cssFiles = [];

        //                 for (const chunk of stats.compilation.chunks) {
        //                     // const chunk = stats.compilation.chunks[chunkId];
        //                     try {
        //                         for (const file of chunk.files) {
        //                             if (/\.css$/i.test(file))
        //                                 cssFiles.push(file);
        //                         }
        //                     } catch (e) {}
        //                 }

        //                 // 拼接抽出的 CSS 文件的内容
        //                 const content =
        //                     Array.isArray(cssFiles) && cssFiles.length
        //                         ? cssFiles
        //                               .filter((filename) => !!assets[filename])
        //                               .map((filename) => {
        //                                   const asset = assets[filename];
        //                                   if (
        //                                       typeof asset.source === 'function'
        //                                   )
        //                                       return asset.source();
        //                                   if (
        //                                       typeof asset._value !==
        //                                       'undefined'
        //                                   )
        //                                       return asset._value;
        //                                   if (
        //                                       typeof asset._cachedSource !==
        //                                       'undefined'
        //                                   )
        //                                       return asset._cachedSource;
        //                                   return '';
        //                               })
        //                               .join('\n\n')
        //                         : '';

        //                 const size = content.length;
        //                 const filename =
        //                     filenamePrefix +
        //                     `extract.all.` +
        //                     md5(content) +
        //                     (size > thresholdStylesExtracted
        //                         ? '.large'
        //                         : '.small') +
        //                     `.css`;

        //                 console.log({ filenamePrefix, filename });

        //                 // 添加 chunk
        //                 const chunk = compilation.addChunk(chunkNameExtractCss);
        //                 chunk.files.add(filename);
        //                 const id = compilation.chunks.size;
        //                 // chunk.files = [filename];
        //                 chunk.id = id;
        //                 chunk.ids = [id];
        //                 // chunk.hash = md5(content);
        //                 // compilation.chunks.add(chunk);

        //                 // 写入 Webpack 文件流
        //                 newCompilationFileDependency(
        //                     compilation,
        //                     filename,
        //                     content
        //                 );
        //                 console.log(stats.compilation.chunks, filename);

        //                 // 针对 SPA 类型: 输出额外的版本，其内的资源引用相对路径不会包含 publicPath
        //                 if (process.env.WEBPACK_BUILD_TYPE === 'spa') {
        //                     const thisFilename =
        //                         filenamePrefix +
        //                         `extract.all.` +
        //                         md5(content) +
        //                         `.url-no-public-path` +
        //                         (size > thresholdStylesExtracted
        //                             ? '.large'
        //                             : '.small') +
        //                         `.css`;

        //                     // 添加 chunk
        //                     const chunk = compilation.addChunk(
        //                         chunkNameExtractCssForImport
        //                     );
        //                     chunk.files.add(filename);
        //                     const id = compilation.chunks.size;
        //                     // chunk.files = [thisFilename];
        //                     chunk.id = id;
        //                     chunk.ids = [id];
        //                     // chunk.hash = md5(content);
        //                     // compilation.chunks.add(chunk);

        //                     const root = postcss.parse(content);
        //                     postcssTransformDeclUrls(root, {
        //                         transformer: (url) => {
        //                             let result = url.replace(
        //                                 new RegExp(
        //                                     `^${stats.compilation.outputOptions.publicPath}`,
        //                                     'g'
        //                                 ),
        //                                 ''
        //                             );
        //                             if (filenamePrefix)
        //                                 result = result.replace(
        //                                     new RegExp(`^${filenamePrefix}`),
        //                                     ''
        //                                 );
        //                             return result;
        //                         },
        //                     });

        //                     // 写入 Webpack 文件流
        //                     newCompilationFileDependency(
        //                         compilation,
        //                         thisFilename,
        //                         root.toString()
        //                     );
        //                 }

        //                 return;
        //             }
        //         );
        //     }
        // );
    }
}

module.exports = CreateGeneralCssBundlePlugin;
