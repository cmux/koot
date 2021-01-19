/* eslint-disable no-console */
// ref: https://github.com/jantimon/html-webpack-plugin

const fs = require('fs-extra');
const path = require('path');

// ============================================================================

/**
 * Webpack 插件 - 生成 SPA 主页面文件
 * @class ModifyServerBundlePlugin
 * @classdesc Webpack 插件 - 生成 SPA 主页面文件
 * @property {String} localeId
 */
class ModifyServerBundlePlugin {
    constructor(settings = {}) {
        this.isServerless = settings.isServerless;
    }

    apply(compiler) {
        // const { isServerless = false } = this;

        if (process.env.WEBPACK_BUILD_ENV === 'prod') {
            compiler.hooks.afterEmit.tapAsync.bind(
                compiler.hooks.afterEmit,
                'ModifyServerBundlePlugin'
            )(async (compilation, callback) => {
                // console.log('ModifyServerBundlePlugin');

                const {
                    outputPath,
                    assetsByChunkName,
                } = compilation.getStats().toJson();
                for (const files of Object.values(assetsByChunkName)) {
                    for (const filename of files) {
                        if (path.extname(filename) === '.js') {
                            await prependDistDir(
                                path.resolve(outputPath, filename)
                            );
                        }
                    }
                }
                callback();
            });
        }
    }
}

module.exports = ModifyServerBundlePlugin;

// ============================================================================

const prependDistDir = async (file) => {
    await fs.writeFile(
        file,
        'if (typeof global.KOOT_DIST_DIR === "undefined") {\n' +
            '    global.KOOT_DIST_DIR = require("path").resolve(__dirname, "../");\n' +
            '}\n\n' +
            // 'console.log(global.KOOT_DIST_DIR);\n\n' +
            (await fs.readFile(file, 'utf-8')),
        'utf-8'
    );
};
