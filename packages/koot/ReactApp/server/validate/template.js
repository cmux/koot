import errorMsg from '../../../libs/error-msg';

/**
 * 验证模板内容
 *
 * 获取环境常量 `process.env.KOOT_HTML_TEMPLATE`，并返回合法的值
 *
 * @param {String} template Koot 配置项: `template`
 * @returns {String}
 */
const validateTemplate = (template) => {
    if (__DEV__) {
        return require('../../../libs/validate-template')(template);
    }

    if (typeof process.env.KOOT_HTML_TEMPLATE === 'string')
        template = process.env.KOOT_HTML_TEMPLATE;

    if (typeof template !== 'string')
        throw new Error(
            errorMsg(
                'VALIDATE_TEMPLATE',
                '`config.template` should be Pathname or EJS String'
            )
        );

    // process.env.KOOT_HTML_TEMPLATE = template

    return template;
};

export default validateTemplate;
