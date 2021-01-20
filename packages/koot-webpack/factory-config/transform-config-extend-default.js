const createGlobalDefaultConfig = require('./create-global-default');

/**
 * Webpack 配置处理 - 确保默认值
 * @async
 * @param {Object} config webpack 配置对象
 * @param {Object} kootBuildConfig
 * @returns {Object} 处理后的 webpack 配置对象
 */
module.exports = async (config = {}, kootBuildConfig = {}, options = {}) => {
    const configGlobalDefault = await createGlobalDefaultConfig(
        kootBuildConfig,
        options
    );

    // 合并 module.rules / loaders
    if (typeof config.module === 'object') {
        if (!Array.isArray(config.module.rules)) {
            config.module.rules = configGlobalDefault.module.rules;
        } else {
            if (config.module.rules[0] === true) {
                config.module.rules.shift();
            } else {
                config.module.rules = [
                    ...configGlobalDefault.module.rules,
                    ...config.module.rules,
                ];
            }
        }
    } else {
        // config.module = configGlobalDefault.module.rules
        config.module = configGlobalDefault.module;
    }

    // 合并 plugins
    if (!Array.isArray(config.plugins)) {
        config.plugins = configGlobalDefault.plugins;
    } else {
        if (config.plugins[0] === true) {
            config.plugins.shift();
        } else {
            config.plugins = [
                ...configGlobalDefault.plugins,
                ...config.plugins,
            ];
        }
    }

    // 合并 resolve
    config.resolve = Object.assign(
        {},
        configGlobalDefault.resolve,
        config.resolve || {}
    );
    // for (let key of Object.keys(configGlobalDefault.resolve)) {

    // }

    return config;
};
