const injectHtmlLang = require('./inject/htmlLang');
const injectMetas = require('./inject/metas');
const injectStyles = require('./inject/styles');
const injectScripts = require('./inject/scripts');

/**
 * 生成 ejs 使用的模板替换对象
 * @param {Object} options 当前设置
 * @param {Object} [options.injectCache={}] 静态注入对象/当前语言的静态注入缓存对象
 * @param {Object} [options.filemap={}] (当前语言的) 文件名对应表
 * @param {Object} [options.entrypoints={}] (当前语言的) 入口表
 * @param {String} [options.localeId] 当前语种 ID
 * @param {Object} [options.localeFileMap] (SPA) 语言包文件对照表
 * @param {string} [options.defaultLocaleId] (SPA) 默认语种 ID
 * @param {String} [options.title] 页面标题
 * @param {String} [options.metaHtml] meta 标签 HTML 代码
 * @param {String} [options.reactHtml] 已处理完毕的 React 同构结果 HTML 代码
 * @param {String} [options.stylesHtml] 已处理完毕的样式结果 HTML 代码
 * @param {String} [options.reduxHtml] 已处理完毕的 redux store 结果 HTML 代码
 * @param {Object} [options.SSRState] SSR 状态对象
 * @param {Object} [options.needInjectCritical] 是否需要自动注入 critical 内容
 * @param {Boolean} [options.needInjectCritical.styles=false]
 * @param {Boolean} [options.needInjectCritical.scripts=false]
 * @returns {Object}
 */
module.exports = (options = {}) => {
    const {
        injectCache = {},

        filemap = {},
        entrypoints = {},
        compilation,

        localeId,
        localeFileMap,
        defaultLocaleId,

        title,
        metaHtml,
        reactHtml,
        stylesHtml,
        reduxHtml,
        SSRState,

        needInjectCritical = {
            styles: false,
            scripts: false
        }
    } = options;

    return {
        htmlLang: injectHtmlLang(localeId),
        title,
        metas: injectMetas({ metaHtml, localeId, compilation }),
        styles: injectStyles({
            needInjectCritical: needInjectCritical.styles,
            injectCache,
            filemap,
            stylesHtml,
            localeId,
            compilation
        }),

        react: reactHtml,

        scripts: injectScripts({
            needInjectCritical: needInjectCritical.scripts,
            injectCache,
            entrypoints,
            localeId,
            localeFileMap,
            defaultLocaleId,
            reduxHtml,
            SSRState,
            compilation
        })
    };
};
