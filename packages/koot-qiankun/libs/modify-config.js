/* eslint-disable no-console */

const path = require('path');

const {
    keyConfigWebpackSPATemplateInject,
    keyConfigBuildDll,
} = require('koot/defaults/before-build');
const __ = require('./translate');

const defaultQiankunConfig = require('./defaults/qiankun-config');
const { entrypointName } = require('./constants');

// ============================================================================

const modifyConfig = async (appConfig) => {
    // if (appConfig[keyConfigBuildDll]) return;

    if (typeof appConfig !== 'object')
        throw new Error('MISSING_PARAMETER: appConfig');

    // ========================================================================
    //
    // 生成 Qiankun 配置对象
    //
    // ========================================================================
    const qiankunConfig = {
        ...(appConfig.qiankun || {}),
        ...defaultQiankunConfig,
    };
    if (!qiankunConfig.name)
        throw new Error(__('MISSING_CONFIG: `qiankun.name`'));
    if (qiankunConfig.basename && !process.env.KOOT_HISTORY_BASENAME) {
        process.env.KOOT_HISTORY_BASENAME = qiankunConfig.basename;
    }

    // ========================================================================
    //
    // 修改 Webpack 配置对象
    //
    // ========================================================================
    const { webpackConfig } = appConfig;

    // 修改 dist
    // appConfig.dist = path.resolve(appConfig.dist, 'build');

    // 修改 Webpack 配置
    appConfig.webpackConfig = await modifyWebpackConfig(
        webpackConfig,
        appConfig,
        qiankunConfig
    );

    return appConfig;
};

module.exports = modifyConfig;

// ============================================================================

const modifyWebpackConfig = async (webpackConfig, appConfig, qiankunConfig) => {
    if (typeof webpackConfig === 'object' && !Array.isArray(webpackConfig))
        return await modifyWebpackConfig(
            [webpackConfig],
            appConfig,
            qiankunConfig
        );

    webpackConfig
        .filter((config) => !config[keyConfigWebpackSPATemplateInject])
        .forEach((webpackConfig) => {
            // ================================================================
            //
            // 修改 output 类型
            //
            // ================================================================
            if (webpackConfig.output.libraryTarget !== 'umd') {
                if (!appConfig[keyConfigBuildDll])
                    webpackConfig.output.library = `${qiankunConfig.name}_[name]`;
                webpackConfig.output.libraryTarget = 'umd';
                webpackConfig.output.chunkLoadingGlobal = `webpackJsonp_${qiankunConfig.name}`;
                webpackConfig.output.globalObject = 'window';
            }

            // ================================================================
            //
            // 处理入口
            //
            // ================================================================
            if (!appConfig[keyConfigBuildDll]) {
                if (Array.isArray(webpackConfig.entry)) {
                    const entry = {
                        client: webpackConfig.entry,
                    };
                    webpackConfig.entry = entry;
                } else if (typeof webpackConfig.entry === 'string') {
                    const entry = {
                        client: [webpackConfig.entry],
                    };
                    webpackConfig.entry = entry;
                }
                for (const key in webpackConfig.entry) {
                    if (!Array.isArray(webpackConfig.entry[key]))
                        webpackConfig.entry[key] = [webpackConfig.entry[key]];
                }

                // 添加新入口: qiankun-entry
                webpackConfig.entry[entrypointName] = [
                    path.resolve(__dirname, './entry.js'),
                ];

                // 向所有入口注入 public-path.js
                if (typeof webpackConfig.entry === 'object') {
                    for (const key in webpackConfig.entry) {
                        if (key === 'library') continue;
                        webpackConfig.entry[key].unshift(
                            path.resolve(__dirname, './pablic-path.js')
                        );
                    }
                }
            }
        });

    // console.log('after modify', { webpackConfig, appConfig });

    return webpackConfig;
};
