const fs = require('fs');

const { dll } = require('../../defaults/dev-request-uri');
const { compilationKeyHtmlMetaTags } = require('../../defaults/before-build');
const getPublic = require('../../utils/get-public-dir');

/**
 * 注入: meta 标签 HTML 代码，以及其他的 <head> 标签中的注入
 * @param {Object} options
 * @param {Object} [options.manifest]
 * @param {String} [options.metaHtml]
 * @param {String} [options.localeId]
 * @param {Object} [options.compilation]
 * @returns {String}
 */
module.exports = ({ metaHtml = '', manifest = {} }) => {
    let r = getDevExtra();

    if (typeof __KOOT_INJECT_METAS_START__ === 'undefined') {
        const {
            __KOOT_INJECT_METAS_START__,
            __KOOT_INJECT_METAS_END__,
        } = require('../../defaults/defines');
        r += `<!--${__KOOT_INJECT_METAS_START__}-->${metaHtml}<!--${__KOOT_INJECT_METAS_END__}-->`;
    } else {
        r += `<!--${__KOOT_INJECT_METAS_START__}-->${metaHtml}<!--${__KOOT_INJECT_METAS_END__}-->`;
    }

    r += manifest[compilationKeyHtmlMetaTags] || '';

    return r;
};

/**
 * [开发环境] 额外内容
 */
const getDevExtra = () => {
    if (process.env.WEBPACK_BUILD_ENV !== 'dev') return '';

    // 判断是否存在 dll 文件，如果存在，在此引入
    const { KOOT_DEV_DLL_FILE_CLIENT: fileDllClient } = process.env;
    if (fileDllClient && fs.existsSync(fileDllClient))
        return `<script type="text/javascript" src="${getPublic()}${dll.replace(
            /^\//,
            ''
        )}" data-koot-entry="client-dev-dll"></script>`;

    return '';
};
