const forWebpackVersion = require('../../../libs/for-webpack-version');

/**
 * 针对 Webpack 5 进行一部分兼容性处理
 * - [官方升级指南](https://webpack.js.org/migrate/5)
 * @param {*} config
 * @returns {Object} config
 */
function transform(config) {
    forWebpackVersion('>= 5.0.0', () => {
        // 确保 `mode` 存在
        if (typeof config.mode === 'undefined') {
            config.mode = 'production';
        }

        // optimization
        if (typeof config.optimization === 'object') {
            if (config.optimization.hashedModuleIds === true) {
                config.optimization.moduleIds = 'deterministic';
                delete config.optimization.hashedModuleIds;
            }
            if (config.optimization.namedChunks === true) {
                config.optimization.chunkIds = 'named';
                delete config.optimization.namedChunks;
            }
            if (config.optimization.namedModules === true) {
                config.optimization.moduleIds = 'named';
                delete config.optimization.namedModules;
            }
            if (config.optimization.noEmitOnErrors === false) {
                config.optimization.emitOnErrors = true;
                delete config.optimization.noEmitOnErrors;
            }
            if (config.optimization.occurrenceOrder === true) {
                config.optimization.chunkIds = 'total-size';
                config.optimization.moduleIds = 'size';
                delete config.optimization.occurrenceOrder;
            }
        }

        // 移除已弃用的选项
        if (typeof config.node === 'object') {
            delete config.node.Buffer;
            delete config.node.process;
        }
    });

    return config;
}

module.exports = transform;
