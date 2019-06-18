const {
    chunkNameExtractCss,
    chunkNameExtractCssForImport
} = require('../../defaults/before-build');
const readClientFile = require('../../utils/read-client-file');
const getClientFilePath = require('../../utils/get-client-file-path');

/**
 * 注入: CSS 代码
 * @param {Object} options
 * @param {Boolean} [options.needInjectCritical]
 * @param {Object} [options.injectCache]
 * @param {String} [options.stylesHtml]
 * @param {String} [options.localeId]
 * @param {Object} [options.filemap]
 * @param {String} [options.compilation]
 * @returns {String}
 */
module.exports = ({
    // needInjectCritical,
    injectCache,
    // filemap,
    stylesHtml,
    localeId,
    compilation
}) => {
    if (typeof injectCache.styles === 'undefined') {
        injectCache.styles = getExtracted(localeId, compilation);

        if (process.env.WEBPACK_BUILD_ENV === 'dev') {
            injectCache.styles +=
                `<style id="__koot-react-hot-loader-error-overlay">` +
                `.react-hot-loader-error-overlay div {` +
                `    z-index: 99999;` +
                `    font-size: 14px;` +
                `    line-height: 1.5em;` +
                `}` +
                `</style>`;
        }
    }

    // if (needInjectCritical && typeof filemap['critical.css'] === 'string') {
    //     injectCache.styles += getCritical()
    // }

    return injectCache.styles + stylesHtml;
};

// const getCritical = () => {
//     if (process.env.WEBPACK_BUILD_ENV === 'dev') {
//         return `<link id="__koot-critical-styles" media="all" rel="stylesheet" href="${getClientFilePath('critical.css')}" />`
//     }
//     return `<style id="__koot-critical-styles" type="text/css">${readClientFile('critical.css')}</style>`
// }

const getExtracted = (localeId, compilation) => {
    const filename = `${chunkNameExtractCss}.css`;

    if (
        process.env.WEBPACK_BUILD_ENV === 'dev' &&
        process.env.WEBPACK_BUILD_TYPE !== 'spa'
    ) {
        // return `<link id="__koot-extracted-styles" media="all" rel="stylesheet" href="${getClientFilePath(
        //     filename,
        //     localeId
        // )}" />`;
        return combineFilePaths(filename, localeId);
    }

    const content = readClientFile(filename, localeId, compilation);

    // 如果内容大于 50k
    if (content.length > 50 * 1000) {
        if (process.env.WEBPACK_BUILD_TYPE === 'spa') {
            return combineFilePaths(
                `${chunkNameExtractCssForImport}.css`,
                localeId
            );
        } else {
            return combineFilePaths(filename, localeId);
        }
        // return `<link id="__koot-extracted-styles" media="all" rel="stylesheet" href="${
        //     process.env.WEBPACK_BUILD_TYPE === 'spa'
        //         ? getClientFilePath(
        //               `${chunkNameExtractCssForImport}.css`,
        //               localeId
        //           )
        //         : getClientFilePath(filename, localeId)
        // }" />`;
    }

    return `<style id="__koot-extracted-styles" type="text/css">${content}</style>`;
};

/**
 * 返回 link 标签
 * 如果有多个结果，会返回包含多个标签的 HTML 结果
 * @param {...any} args `utils/get-client-file-path` 对应的参数
 * @returns {String} 整合的 HTML 结果
 */
const combineFilePaths = (...args) => {
    let pathnames = getClientFilePath(...args);
    if (!Array.isArray(pathnames)) pathnames = [pathnames];
    return pathnames
        .map(
            pathname =>
                `<link id="__koot-extracted-styles" media="all" rel="stylesheet" href="${pathname}" />`
        )
        .join('');
};
