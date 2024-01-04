/* eslint-disable no-console */

const {
    keyConfigWebpackSPATemplateInject,
    keyConfigBuildDll,
} = require('koot/defaults/before-build');

// ============================================================================

/**
 * 修改 appConfig
 */
const modifyConfig = async (appConfig) => {
    if (appConfig[keyConfigBuildDll]) return;

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
    // 修改 target
    //
    // ========================================================================
    webpackConfig
        .filter((config) => !config[keyConfigWebpackSPATemplateInject])
        .forEach((config) => {
            config.target = 'electron-renderer';
        });

    // ========================================================================
    //
    // 调整最后一条配置
    //
    // ========================================================================

    // const lastConfig = webpackConfig
    //     .filter((config) => !config[keyConfigWebpackSPATemplateInject])
    //     .slice(-1)[0];

    // console.log('after modify', { webpackConfig, appConfig });

    return webpackConfig;
};
