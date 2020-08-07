const fs = require('fs-extra');
const path = require('path');
const md5 = require('md5');
const favicons = require('favicons');

const isHotUpdate = require('../libs/is-compilation-hot-update-only');
const newCompilationFileDependency = require('../libs/new-compilation-file-dependency');

const { compilationKeyHtmlMetaTags } = require('koot/defaults/before-build');

/**
 * Webpack 插件 - 自动生成 manifest.json
 */
class KootCreateManifestPlugin {
    constructor(settings = {}) {
        this.settings = settings;
    }
    apply(compiler) {
        const { icons, webApp, localeId, outputPath } = this.settings;

        compiler.hooks.afterCompile.tapAsync.bind(
            compiler.hooks.afterCompile,
            'KootCreateManifestPlugin'
        )(async (compilation, callback) => {
            const stats = compilation.getStats();

            // 如果本次为热更新，不执行后续流程
            if (isHotUpdate(stats)) return callback();

            const subfolder =
                'webapp.' +
                md5(
                    JSON.stringify({
                        ...icons,
                        ...webApp,
                    }) + (localeId || '')
                ).substr(0, 8);

            const filenameHtmls = md5('htmls');
            const fileHtmls = path.resolve(
                outputPath,
                subfolder,
                filenameHtmls
            );

            if (fs.existsSync(fileHtmls)) {
                compilation[compilationKeyHtmlMetaTags] = await fs.readFile(
                    fileHtmls,
                    'utf-8'
                );

                return callback();
            }

            const { images, files, html } = await new Promise(
                (resolve, reject) => {
                    favicons(
                        icons.square || icons.original,
                        {
                            ...getFaviconsConfig(webApp),
                            path: `${
                                process.env.WEBPACK_BUILD_TYPE === 'spa'
                                    ? ''
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

            for (const { name, contents } of [...images, ...files]) {
                newCompilationFileDependency(
                    compilation,
                    `${subfolder}/${name}`,
                    contents
                );
                if (name === 'favicon.ico')
                    newCompilationFileDependency(compilation, name, contents);
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
            const metaHtml = Array.isArray(html) ? html.join('') : html;
            compilation[compilationKeyHtmlMetaTags] = metaHtml;

            newCompilationFileDependency(
                compilation,
                `${subfolder}/${filenameHtmls}`,
                metaHtml
            );

            return callback();
        });
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
    ].forEach(([from, to]) => {
        config[to] = config[from];
        delete config[from];
    });

    return config;
};
