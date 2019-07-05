/**
 * 配置转换 - 兼容性处理 - 多语言相关选项
 * - i18n.type
 * @async
 * @param {Object} config
 * @void
 */
module.exports = async config => {
    if (typeof config.i18n === 'object' && config.i18n.type === 'redux')
        config.i18n.type = 'store';
};
