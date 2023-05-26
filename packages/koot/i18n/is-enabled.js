/**
 * 检查当前项目是否开启多语言支持
 * @returns {Boolean}
 */
const isI18nEnabled = () => {
    if (!process.env.KOOT_I18N || !JSON.parse(process.env.KOOT_I18N))
        return false;
    return true;
};

export default isI18nEnabled;
