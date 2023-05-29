import isI18nEnabled from './is-enabled.js';

/**
 * 获取当前多语言配置类型
 * @returns {String}
 */
const getType = () =>
    isI18nEnabled()
        ? JSON.parse(process.env.KOOT_I18N_TYPE) || 'default'
        : undefined;

export default getType;
