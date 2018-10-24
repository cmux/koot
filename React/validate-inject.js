import { localeId as theLocaleId } from '../index'

import injectHtmlLang from './inject/htmlLang'
import injectMetas from './inject/metas'
import injectStyles from './inject/styles'
import injectScripts from './inject/scripts'

/**
 * 生成 ejs 使用的模板替换对象
 * @param {Object} options 当前设置
 * @param {Object} [options.injectCache={}] 静态注入对象/当前语言的静态注入缓存对象
 * @param {Object} [options.filemap={}] (当前语言的) 文件名对应表
 * @param {Object} [options.entrypoints={}] (当前语言的) 入口表
 * @param {String} [localeId] 当前语种 ID
 * @param {String} [title] 页面标题
 * @param {String} [metaHtml] meta 标签 HTML 代码
 * @param {String} [reactHtml] 已处理完毕的 React 同构结果 HTML 代码
 * @param {String} [stylesHtml] 已处理完毕的样式结果 HTML 代码
 * @param {String} [reduxHtml] 已处理完毕的 redux store 结果 HTML 代码
 * @param {Object} [needInjectCritical] 是否需要自动注入 critical 内容
 * @param {Boolean} [needInjectCritical.styles=false]
 * @param {Boolean} [needInjectCritical.scripts=false]
 * @returns {Object}
 */
export default (options = {}) => {
    const {
        injectCache = {},

        filemap = {},
        entrypoints = {},

        localeId = theLocaleId,
        title,
        metaHtml,
        reactHtml,
        stylesHtml,
        reduxHtml,

        needInjectCritical = {
            styles: false,
            scripts: false,
        },
    } = options

    return {

        htmlLang: injectHtmlLang(localeId),
        title,
        metas: injectMetas(metaHtml),
        styles: injectStyles(needInjectCritical.styles, injectCache, filemap, stylesHtml),

        react: reactHtml,

        scripts: injectScripts(needInjectCritical.scripts, injectCache, entrypoints, reduxHtml),

    }
}
