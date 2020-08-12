/**
 * 生成配置片段 - module.rules
 * @returns {Array}
 */
module.exports = (kootBuildConfig = {}, options = {}) => [
    ...require('./javascript')(kootBuildConfig, options),
    ...require('./css')(kootBuildConfig, options)
];
