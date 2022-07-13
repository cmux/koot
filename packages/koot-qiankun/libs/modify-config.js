/* eslint-disable no-console */

const path = require('path');

const __ = require('./translate');

const defaultQiankunConfig = require('./defaults/qiankun-config');

// ============================================================================

const modifyConfig = async (appConfig) => {
    // if (appConfig[keyConfigBuildDll]) return;

    if (typeof appConfig !== 'object')
        throw new Error('MISSING_PARAMETER: appConfig');

    const { webpackConfig } = appConfig;

    // 修改 dist
    // appConfig.dist = path.resolve(appConfig.dist, 'build');

    // 修改 Webpack 配置
    appConfig.webpackConfig = await modifyWebpackConfig(
        webpackConfig,
        appConfig
    );

    return appConfig;
};

module.exports = modifyConfig;

// ============================================================================

const modifyWebpackConfig = async (webpackConfig, appConfig) => {
    if (typeof webpackConfig === 'object' && !Array.isArray(webpackConfig))
        return await modifyWebpackConfig([webpackConfig], appConfig);

    // ========================================================================
    //
    // 生成 Qiankun 配置对象
    //
    // ========================================================================
    const config = {
        ...(appConfig.qiankun || {}),
        ...defaultQiankunConfig,
    };
    if (!config.name) throw new Error(__('NO `qiankun.name` GIVEN!'));

    // ========================================================================
    //
    // 修改 output 类型
    //
    // ========================================================================
    if (webpackConfig.output.libraryTarget !== 'umd') {
        webpackConfig.output.library = `${config.name}_[name]`;
        webpackConfig.output.libraryTarget = 'umd';
    }

    // ========================================================================
    //
    // 预处理入口
    //
    // ========================================================================
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

    // ========================================================================
    //
    // 添加新入口: qiankun-entry
    //
    // ========================================================================
    webpackConfig.entry['qiankun-entry'] = path.resolve(
        __dirname,
        './entry.js'
    );

    // ========================================================================
    //
    // 向所有入口注入 public-path.js
    //
    // ========================================================================
    if (typeof webpackConfig.entry === 'object') {
        for (const key in webpackConfig.entry) {
            webpackConfig.entry[key].unshift(
                path.resolve(__dirname, './pablic-path.js')
            );
        }
    }

    // console.log('after modify', { webpackConfig, appConfig });

    return webpackConfig;
};
