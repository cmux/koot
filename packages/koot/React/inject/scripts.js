const path = require('path');

const { chunkNameClientRunFirst } = require('../../defaults/before-build');
const defaultEntrypoints = require('../../defaults/entrypoints');
const readClientFile = require('../../utils/read-client-file');
const getClientFilePath = require('../../utils/get-client-file-path');

/**
 * 注入: JavaScript 代码
 * @param {Object} options
 * @param {Boolean} [options.needInjectCritical]
 * @param {Object} [options.injectCache]
 * @param {Object} [options.entrypoints]
 * @param {String} [options.localeId]
 * @param {String} [options.reduxHtml]
 * @param {Object} [options.compilation]
 * @param {Object} [options.SSRState]
 * @returns {String}
 */
module.exports = ({
    needInjectCritical,
    injectCache,
    entrypoints,
    localeId,
    reduxHtml,
    SSRState = {},
    compilation
}) => {
    const ENV = process.env.WEBPACK_BUILD_ENV;
    const isDev = Boolean(
        ENV === 'dev' || (typeof __DEV__ !== 'undefined' && __DEV__)
    );
    const isProd = !isDev;

    if (isDev || typeof injectCache.scriptsInBody === 'undefined') {
        let r = '';

        // 入口: critical
        if (needInjectCritical && Array.isArray(entrypoints.critical)) {
            r += entrypoints.critical
                .filter(file => path.extname(file) === '.js')
                .map(file => {
                    if (isDev) {
                        return getClientFilePath(true, file);
                    }
                    return `<script type="text/javascript">${readClientFile(
                        true,
                        file
                    )}</script>`;
                })
                .join('');
        }

        // 其他默认入口
        // console.log('defaultEntrypoints', defaultEntrypoints)
        // console.log('entrypoints', entrypoints)
        defaultEntrypoints.forEach(key => {
            if (Array.isArray(entrypoints[key])) {
                r += entrypoints[key]
                    .filter(file => /\.(js|jsx|mjs|ejs)$/.test(file))
                    .map(file => {
                        // console.log(file)
                        // if (isDev)
                        // return `<script type="text/javascript" src="${getClientFilePath(true, file)}" defer></script>`
                        // return `<script type="text/javascript" src="${getClientFilePath(
                        //     true,
                        //     file
                        // )}" defer></script>`;
                        return combineFilePaths(true, file);
                    })
                    .join('');
            }
        });

        // 如果设置了 PWA 自动注册 Service-Worker，在此注册
        const pwaAuto =
            typeof process.env.KOOT_PWA_AUTO_REGISTER === 'string'
                ? JSON.parse(process.env.KOOT_PWA_AUTO_REGISTER)
                : false;
        if (pwaAuto && typeof injectCache.pathnameSW === 'string') {
            r += `<script id="__koot-pwa-register-sw" type="text/javascript">`;
            if (isProd)
                r +=
                    `if ('serviceWorker' in navigator) {` +
                    // + `navigator.serviceWorker.register("${injectCache.pathnameSW}?koot=${process.env.KOOT_VERSION}",`
                    `navigator.serviceWorker.register("${
                        injectCache.pathnameSW
                    }?koot=0.8",` +
                    `{scope: '/'}` +
                    `)` +
                    `.catch(err => {console.log('👩‍💻 Service Worker SUPPORTED. ERROR', err)})` +
                    `}else{console.log('👩‍💻 Service Worker not supported!')}`;
            if (isDev) r += `console.log('👩‍💻 No Service Worker for DEV mode.')`;
            r += `</script>`;
        }

        injectCache.scriptsInBody = r;
    }

    return (
        `<script type="text/javascript">` +
        (reduxHtml ? reduxHtml : `window.__REDUX_STATE__ = {};`) +
        `window.__KOOT_LOCALEID__ = "${SSRState.localeId || ''}";` +
        `window.__KOOT_SSR_STATE__ = ${JSON.stringify(SSRState)};` +
        `</script>` +
        getClientRunFirstJS(localeId, compilation) +
        `${injectCache.scriptsInBody}`
    );
};

/**
 * 客户端预先执行 JS 的代码
 * @param {*} localeId
 * @param {*} compilation
 * @returns {String}
 */
const getClientRunFirstJS = (localeId, compilation) => {
    const filename = `${chunkNameClientRunFirst}.js`;

    if (process.env.WEBPACK_BUILD_ENV === 'dev') {
        return combineFilePaths(filename, localeId);
        // return `<script type="text/javascript" src="${getClientFilePath(
        //     filename,
        //     localeId
        // )}"></script>`;
    }

    return `<script type="text/javascript">${readClientFile(
        filename,
        localeId,
        compilation
    )}</script>`;
};

/**
 * 返回 script 标签
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
                `<script type="text/javascript" src="${pathname}"></script>`
        )
        .join('');
};
