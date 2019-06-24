const isI18nEnabled = require('./is-enabled');

/**
 * 获取当前多语言配置类型
 * @returns {String}
 */
module.exports = () =>
    isI18nEnabled()
        ? JSON.parse(process.env.KOOT_I18N_TYPE) || 'default'
        : undefined;
