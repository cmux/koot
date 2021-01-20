const common = require('./common');

/**
 * 生产通用默认配置对象
 * @async
 * @param {Object} [options={}] 生产配置时使用的选项
 * @param {Object} [options.aliases]
 * @param {Object} [options.defines]
 * @param {Object} [options.css]
 * @returns {Object} 通用配置对象
 */
module.exports = async (kootBuildConfig = {}, options = {}) => {
    const { WEBPACK_BUILD_ENV: ENV, WEBPACK_BUILD_STAGE: STAGE } = process.env;

    return await common.factory(
        {
            env: ENV,
            stage: STAGE,

            spa: false,

            ...kootBuildConfig,
        },
        options
    );
};
