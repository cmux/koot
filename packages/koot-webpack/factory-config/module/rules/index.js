/**
 * 生成配置片段 - module.rules
 * @returns {Array}
 */
module.exports = (kootBuildConfig = {}) => ([
    ...require('./javascript')(kootBuildConfig),
    ...require('./css')(kootBuildConfig)
])
