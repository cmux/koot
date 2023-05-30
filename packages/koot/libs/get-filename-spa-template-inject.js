import { filenameSPATemplateInjectJS } from '../defaults/before-build.js';

/**
 * 获取文件名: SPA 模板注入 JS
 * @param {String} [localeId]
 * @returns {String}
 */
const getFilenameSpaTemplateInject = (localeId) => {
    if (localeId)
        return filenameSPATemplateInjectJS.replace(/LOCALEID/, localeId);
    return filenameSPATemplateInjectJS.replace(/\.LOCALEID/, '');
};
export default getFilenameSpaTemplateInject;
