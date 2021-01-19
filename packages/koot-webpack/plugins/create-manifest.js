const fs = require('fs-extra');
const path = require('path');
const md5 = require('md5');
const favicons = require('favicons');
const findCacheDir = require('find-cache-dir');
const { Compilation } = require('webpack');

const isHotUpdate = require('../libs/is-compilation-hot-update-only');
// const newCompilationFileDependency = require('../libs/new-compilation-file-dependency');
const compilationEmitAsset = require('../libs/compilation-emit-asset');

const { compilationKeyHtmlMetaTags } = require('koot/defaults/before-build');
const { publicPathPrefix } = require('koot/defaults/webpack-dev-server');
const sleep = require('koot/utils/sleep');

/**
 * Webpack 插件 - 自动生成 manifest.json
 */
class KootCreateManifestPlugin {
    constructor(settings = {}) {
        this.settings = settings;
    }
    apply(compiler) {
        const {
            icons,
            webApp,
            localeId,
            // outputPath,
            filenamePrefix = '',
        } = this.settings;

        compiler.hooks.thisCompilation.tap(
            'KootCreateManifestPlugin',
            (compilation) => {
                compilation.hooks.processAssets.tapAsync(
                    {
                        name: 'KootCreateManifestPlugin',
                        stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE,
                    },
                    async (compilationAssets, callback) => {
                        const stats = compilation.getStats();

                        // 如果本次为热更新，不执行后续流程
                        if (isHotUpdate(stats)) return callback();

                        // 如果已有结果，不执行
                        if (compilation[compilationKeyHtmlMetaTags])
                            return callback();

                        // 如果没有图标，不执行
                        if (!icons) return callback();

                        const subfolderName =
                            'webapp.' +
                            md5(
                                JSON.stringify({
                                    ...icons,
                                    ...webApp,
                                }) +
                                    (localeId || '') +
                                    (process.env.WEBPACK_BUILD_ENV || '') +
                                    (process.env.WEBPACK_BUILD_TYPE || '')
                            ).substr(0, 8);
                        const subfolder = filenamePrefix + subfolderName;
                        const cacheFolder = path.resolve(
                            findCacheDir({ name: 'koot-webapp-icons' }),
                            subfolderName
                        );
                        // const outputFolder = path.resolve(outputPath, subfolder);
                        const filenameHtmls = md5('htmls');
                        const fileCached = path.resolve(
                            cacheFolder,
                            filenameHtmls
                        );

                        async function addFile(filename, contents) {
                            compilationEmitAsset(
                                compilation,
                                `${subfolder}/${filename}`,
                                contents
                            );
                            if (filename === 'favicon.ico') {
                                await sleep(1);
                                compilationEmitAsset(
                                    compilation,
                                    filename,
                                    contents
                                );
                            }
                            await sleep(1);
                        }

                        await fs.ensureDir(cacheFolder);
                        if (fs.existsSync(fileCached)) {
                            compilation[
                                compilationKeyHtmlMetaTags
                            ] = await fs.readFile(fileCached, 'utf-8');
                            for (const filename of fs.readdirSync(
                                cacheFolder
                            )) {
                                if (filename === filenameHtmls) continue;
                                const file = path.resolve(
                                    cacheFolder,
                                    filename
                                );
                                const contents = await fs.readFile(file);
                                await addFile(filename, contents);
                            }

                            return callback();
                        }

                        const { images, files, html } = await new Promise(
                            (resolve, reject) => {
                                favicons(
                                    icons.square || icons.original,
                                    {
                                        ...getFaviconsConfig(webApp),
                                        path: `${
                                            process.env.WEBPACK_BUILD_TYPE ===
                                            'spa'
                                                ? ''
                                                : process.env
                                                      .WEBPACK_BUILD_ENV ===
                                                  'dev'
                                                ? `/${publicPathPrefix}/dist/`
                                                : '/'
                                        }${subfolder}`,
                                        lang: localeId || null,
                                    },
                                    (err, res) => {
                                        if (err) return reject(err);
                                        resolve(res);
                                    }
                                );
                            }
                        );

                        for (const { name, contents } of [
                            ...images,
                            ...files,
                        ]) {
                            await addFile(name, contents);

                            // 文件写入缓存目录
                            await fs
                                .writeFile(
                                    path.resolve(cacheFolder, name),
                                    contents,
                                    typeof contents === 'string'
                                        ? 'utf-8'
                                        : undefined
                                )
                                .catch((err) => console.error(err));
                        }

                        // const manifest = { icons, webApp };
                        // const filename = `manifest.${md5(manifest)}.json`;

                        // // 添加 chunk
                        // newCompilationChunk(compilation, filename);

                        // // 写入 Webpack 文件流
                        // newCompilationFileDependency(
                        //     compilation,
                        //     filename,
                        //     JSON.stringify(manifest, undefined, 4)
                        // );

                        // 添加信息到 compilation
                        const metaHtml = Array.isArray(html)
                            ? html.join('')
                            : html;
                        // compilation[compilationKeyHtmlMetaTags] = metaHtml;
                        compilationEmitAsset(
                            compilation,
                            compilationKeyHtmlMetaTags,
                            metaHtml
                        );

                        // newCompilationFileDependency(
                        //     compilation,
                        //     `${subfolder}/${filenameHtmls}`,
                        //     metaHtml
                        // );
                        await fs
                            .writeFile(fileCached, metaHtml, 'utf-8')
                            .catch((err) => console.error(err));

                        return callback();
                    }
                );
            }
        );
    }
}

module.exports = KootCreateManifestPlugin;

// ============================================================================

const getFaviconsConfig = (webApp) => {
    /*
name -> appName
shortName -> appShortName
description -> appDescription
themeColor -> theme_color
自动生成
path
lang
appleStatusBarStyle: "black-translucent"
*/
    const config = {
        appleStatusBarStyle: 'black-translucent',
        ...webApp,
    };

    [
        ['name', 'appName'],
        ['shortName', 'appShortName'],
        ['description', 'appDescription'],
        ['themeColor', 'theme_color'],
        ['backgroundColor', 'background'],
        ['startUrl', 'start_url'],
    ].forEach(([from, to]) => {
        config[to] = config[from];
        delete config[from];
    });

    if (!config.appShortName) config.appShortName = config.appName;

    return config;
};
