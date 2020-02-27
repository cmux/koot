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
        const { isServerless = false } = this;

        if (isServerless) {
            compiler.hooks.afterEmit.tapAsync.bind(
                compiler.hooks.afterEmit,
                'ModifyServerBundlePlugin'
            )(async (compilation, callback) => {
                const { outputPath } = compilation.getStats().toJson();
                const filename = 'index.js';
                const file = path.resolve(outputPath, filename);

                await fs.writeFile(
                    file,
                    'const path = require("path");\n' +
                        'global.KOOT_DIST_DIR = path.resolve(__dirname, "../");\n\n' +
                        // 'console.log(global.KOOT_DIST_DIR);\n\n' +
                        (await fs.readFile(file, 'utf-8')),
                    'utf-8'
                );

                callback();
            });
        }
    }
}

module.exports = ModifyServerBundlePlugin;
