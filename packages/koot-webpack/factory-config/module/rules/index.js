/**
 * 生成配置片段 - module.rules
 * @returns {Array}
 */
module.exports = (options = {}) => ([
    ...require('./javascript')(options),
    ...require('./css')(options)
])
