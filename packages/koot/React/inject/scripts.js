const path = require('path');

const {
    chunkNameClientRunFirst,
    scriptTagEntryAttributeName,
    thresholdScriptRunFirst
} = require('../../defaults/before-build');
const defaultEntrypoints = require('../../defaults/entrypoints');
const readClientFile = require('../../utils/read-client-file');
const getClientFilePath = require('../../utils/get-client-file-path');
const getSSRStateString = require('../../libs/get-ssr-state-string');
const {
    scriptsRunFirst,
    scriptsInBody,
    uriServiceWorker
} = require('./_cache-keys');

let isSPAi18nEnabled = false;

/**
 * 注入: JavaScript 代码
 * @param {Object} options
 * @param {Boolean} [options.needInjectCritical]
 * @param {Object} [options.injectCache]
 * @param {Object} [options.entrypoints]
 * @param {String} [options.localeId]
 * @param {Object} [options.localeFileMap]
 * @param {string} [options.defaultLocaleId]
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
    localeFileMap,
    defaultLocaleId,
    reduxHtml,
    SSRState = {},
    compilation
}) => {
    const ENV = process.env.WEBPACK_BUILD_ENV;
    const isDev = Boolean(
        ENV === 'dev' || (typeof __DEV__ !== 'undefined' && __DEV__)
    );
    // const isProd = !isDev;
    const isSPA = Boolean(process.env.WEBPACK_BUILD_TYPE === 'spa');
    /** @type {boolean} 启用多语言的 SPA */
    isSPAi18nEnabled = Boolean(
        isSPA &&
            typeof localeFileMap === 'object' &&
            Object.keys(localeFileMap).length &&
            defaultLocaleId
    );

    if (isDev || typeof injectCache[scriptsRunFirst] === 'undefined') {
        const filename = `${chunkNameClientRunFirst}.js`;
        const name = '*run-first';
        if (isDev) {
            injectCache[scriptsRunFirst] = combineFilePaths(
                name,
                filename,
                localeId
            );
        } else {
            const content = scriptTagsFromContent(
                name,
                filename,
                localeId,
                compilation
            );
            if (content.length > thresholdScriptRunFirst) {
                injectCache[scriptsRunFirst] = combineFilePaths(
                    name,
                    filename,
                    localeId
                );
            } else {
                injectCache[scriptsRunFirst] = content;
            }
        }
    }

    if (isDev || typeof injectCache[scriptsInBody] === 'undefined') {
        let r = '';

        // 入口: critical
        if (needInjectCritical && Array.isArray(entrypoints.critical)) {
            r += entrypoints.critical
                .filter(file => path.extname(file) === '.js')
                .map(file => {
                    if (isDev) {
                        // return `<script type="text/javascript" src="${getClientFilePath(true, file)}"></script>`;
                        return combineFilePaths('critical', true, file);
                    }
                    return scriptTagsFromContent('critical', true, file);
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
                        return combineFilePaths(key, true, file);
                    })
                    .join('');
            }
        });

        // 如果设置了 PWA 自动注册 Service-Worker，在此注册
        const pwaAuto =
            typeof process.env.KOOT_PWA_AUTO_REGISTER === 'string'
                ? JSON.parse(process.env.KOOT_PWA_AUTO_REGISTER)
                : false;
        // console.log({
        //     pwaAuto,
        //     'injectCache[uriServiceWorker]': injectCache[uriServiceWorker]
        // });
        if (
            pwaAuto &&
            (process.env.WEBPACK_BUILD_TYPE === 'spa' ||
                typeof injectCache[uriServiceWorker] === 'string')
        ) {
            r +=
                `<script id="__koot-pwa-register-sw" type="text/javascript">` +
                // if (isProd) {
                `if ('serviceWorker' in navigator) {` +
                `window.addEventListener('load', function() {` +
                // + `navigator.serviceWorker.register("${injectCache[uriServiceWorker]}?koot=${process.env.KOOT_VERSION}",`
                `navigator.serviceWorker.register("${injectCache[
                    uriServiceWorker
                ] || JSON.parse(process.env.KOOT_PWA_PATHNAME)}?koot=0.12",` +
                `{scope: '/'}` +
                `)` +
                `.catch(err => {console.log('👩‍💻 Service Worker SUPPORTED. ERROR', err)})` +
                `});` +
                `}else{console.log('👩‍💻 Service Worker not supported!')}` +
                // } else if (isDev) {
                //     r += `console.log('👩‍💻 No Service Worker for DEV mode.')`;
                // }
                `</script>`;
        }

        injectCache[scriptsInBody] = r;
    }

    if (isSPAi18nEnabled) {
        return (
            `<script type="text/javascript" ${scriptTagEntryAttributeName}="*run-first-spa-locales">` +
            // `window.__KOOT_SCRIPTS__ = {` +
            // `addAfterLocale: function(name, src) {` +
            // `if (` +
            // `typeof window.__KOOT_SPA_LOCALE_FILE_MAP__ === 'object' &&` +
            // `window.__KOOT_LOCALEID__ &&` +
            // `typeof window.__KOOT_SSR_STATE__.locales === 'undefined'` +
            // `) {` +
            // `return setTimeout(() => {` +
            // `return window.__KOOT_SCRIPTS__.addAfterLocale(name, src);` +
            // `}, 10);` +
            // `}` +
            // `var fjs = document.getElementsByTagName('script')[0];` +
            // `var js = document.createElement('script');` +
            // `js.setAttribute("${scriptTagEntryAttributeName}", name);` +
            // `js.setAttribute('defer', '');` +
            // `js.onerror = function(e) {` +
            // `console.error(e);` +
            // `throw new Error(` +
            // `'Locale javascript file ('+src+') fail!'` +
            // `);` +
            // `};` +
            // `js.src = src;` +
            // `fjs.parentNode.insertBefore(js, fjs);` +
            // `}` +
            // `};` +
            `window.__KOOT_SPA_LOCALE_FILE_MAP__ = ${JSON.stringify(
                localeFileMap
            )};` +
            `</script>` +
            // getClientRunFirstJS(localeId, compilation) +
            injectCache[scriptsRunFirst] +
            injectCache[scriptsInBody]
        );
    }

    return (
        `<script type="text/javascript">` +
        (reduxHtml ? reduxHtml : `window.__REDUX_STATE__ = {};`) +
        `window.__KOOT_LOCALEID__ = "${SSRState.localeId || ''}";` +
        `window.__KOOT_SSR_STATE__ = ${getSSRStateString(SSRState)};` +
        `</script>` +
        // getClientRunFirstJS(localeId, compilation) +
        injectCache[scriptsRunFirst] +
        injectCache[scriptsInBody]
    );
};

/**
 * 返回引用地址的 script 标签
 * 如果有多个结果，会返回包含多个标签的 HTML 结果
 * @param {string} name 入口名/标识符
 * @param {...any} args `utils/get-client-file-path` 对应的参数
 * @returns {String} 整合的 HTML 结果
 */
const combineFilePaths = (name, ...args) => {
    let pathnames = getClientFilePath(...args);
    if (!Array.isArray(pathnames)) pathnames = [pathnames];

    // if (name !== '*run-first' && isSPAi18nEnabled) {
    //     return pathnames
    //         .map(
    //             (pathname, index) =>
    //                 `<script type="text/javascript">` +
    //                 `window.__KOOT_SCRIPTS__.addAfterLocale("${name}", "${pathname}")` +
    //                 `</script>`
    //         )
    //         .join('');
    // }

    return pathnames
        .map(
            pathname =>
                `<script type="text/javascript" src="${pathname}" defer ${scriptTagEntryAttributeName}="${name}"></script>`
        )
        .join('');
};

/**
 * 返回 script 标签，标签内容为源代码字符串
 * 如果有多个结果，会返回包含多个标签的 HTML 结果
 * @param {string} name 入口名/标识符
 * @param {...any} args `utils/read-client-file` 对应的参数
 * @returns {String} 整合的 HTML 结果
 */
const scriptTagsFromContent = (name, ...args) =>
    `<script type="text/javascript" ${scriptTagEntryAttributeName}="${name}">${readClientFile(
        ...args
    )}</script>`;
