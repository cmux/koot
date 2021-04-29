const fs = require('fs-extra');
const path = require('path');
const { Compilation } = require('webpack');
const { ConcatSource } = require('webpack-sources');

// const { filenameDll } = require('koot/defaults/before-build')
const getCWD = require('koot/utils/get-cwd');
const getFlagFile = require('koot/libs/get-flag-file');
const isHotUpdate = require('../libs/is-compilation-hot-update-only');

// let opened = false

/**
 * Webpack 插件 - 开发环境扩展
 */
class DevModePlugin {
    constructor({ dist, template, afterEmit, done }) {
        this.dist = dist;
        this.template = template;
        this.afterEmit = afterEmit;
        this.done = done;
    }

    apply(compiler) {
        const { afterEmit, done, template } = this;

        const TYPE = process.env.WEBPACK_BUILD_TYPE;
        const ENV = process.env.WEBPACK_BUILD_ENV;
        const STAGE = process.env.WEBPACK_BUILD_STAGE;

        let hotUpdate = false;

        // afterEmit - 检查是否为热更新
        compiler.hooks.afterEmit.tapAsync.bind(
            compiler.hooks.afterEmit,
            'GenerateChunkmap'
        )(async (compilation, callback) => {
            hotUpdate = isHotUpdate(compilation);
            if (typeof afterEmit === 'function') afterEmit();
            callback();
        });

        if (STAGE === 'server' && ENV === 'dev') {
            // 如果存在 DLL 结果，写入到 index.js 文件开端
            compiler.hooks.thisCompilation.tap(
                'KootDevModePlugin',
                (compilation) => {
                    compilation.hooks.processAssets.tap(
                        {
                            name: 'KootDevModePlugin',
                            stage:
                                /**
                                 * Generate the html after minification and dev tooling is done
                                 */
                                Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE,
                        },
                        (compilationAssets) => {
                            if (typeof this.dist !== 'string' || !this.dist)
                                return;

                            const {
                                KOOT_DEV_DLL_FILE_SERVER: fileDll,
                            } = process.env;
                            if (!fileDll || !fs.existsSync(fileDll)) return;

                            for (const chunk of [...compilation.chunks]) {
                                if (!chunk.canBeInitial()) {
                                    continue;
                                }
                                // console.log(chunk);
                                [...chunk.files]
                                    .filter(
                                        (filename) => filename === 'index.js'
                                    )
                                    .forEach((filename) => {
                                        compilation.assets[
                                            filename
                                        ] = new ConcatSource(
                                            fs.readFileSync(fileDll, 'utf-8'),
                                            '\n',
                                            compilation.assets[filename]
                                        );
                                    });
                            }
                        }
                    );
                }
            );
            // 每次打包前，新建一个 flag 文件
            compiler.hooks.watchRun.tap(
                'KootDevModePlugin',
                async (compilation) => {
                    const file = getFlagFile.devBuildingServer();
                    fs.ensureFileSync(file);
                    fs.writeFile(file, new Date().toLocaleString(), 'utf-8');
                }
            );
        }

        compiler.hooks.afterCompile.tap.bind(
            compiler.hooks.afterCompile,
            'DevModePlugin'
        )(async (compilation) => {
            /**
             * [SSR/server] [SPA]
             * 监视 ejs 模板，如果文件改变触发重新打包
             */
            if (
                (STAGE === 'server' || TYPE === 'spa') &&
                typeof template === 'string'
            ) {
                const file = path.resolve(getCWD(), template);
                if (fs.existsSync(file)) {
                    compilation.fileDependencies.add(file);
                }
            }
        });

        // done - 执行 after 回调
        compiler.hooks.done.tapAsync.bind(
            compiler.hooks.done,
            'DevModePlugin'
        )((compilation, callback) => {
            // console.log('\n\n\nhotUpdate', hotUpdate)

            // 如果当前为热更新，取消流程
            if (hotUpdate) return callback();

            if (typeof done === 'function') {
                done();
                // setTimeout(() => {
                //     if (!TYPE === 'spa') {
                //         console.log('\n')
                //     }
                // })
            }

            callback();
        });
    }
}

module.exports = DevModePlugin;
