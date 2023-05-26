/* eslint-disable import/no-anonymous-default-export */

// 处理项目配置相关
export const keyFileProjectConfigTempFull = '__FILE_PROJECT_CONFIG_TEMP_FULL__';
export const keyFileProjectConfigTempPortionServer =
    '__FILE_PROJECT_CONFIG_TEMP_PORTION_SERVER__';
export const keyFileProjectConfigTempPortionClient =
    '__FILE_PROJECT_CONFIG_TEMP_PORTION_CLIENT__';
export const keyFileProjectConfigTempPortionOtherClient =
    '__FILE_PROJECT_CONFIG_TEMP_PORTION_OTHER_CLIENT__';
export const keyKootBaseVersion = '__KOOT_BASE_VERSION__';
export const dirConfigTemp = 'logs/tmp/config';
export const filenameProjectConfigTempFull = 'full.*.js';
export const filenameProjectConfigTempPortionServer = 'portion.server.*.js';
export const filenameProjectConfigTempPortionClient = 'portion.client.*.js';
export const filenameProjectConfigTempPortionOtherClient =
    'portion.client-other.*.js';
export const propertiesToExtract = [
    ['name', ''],
    ['type', 'react'],
    ['template', ''],
    ['templateInject', ''],
    ['routes', ''],
    ['historyType', ''],
    ['store', ''],
    ['cookiesToStore', ''],
    ['client', {}],
    ['server', {}],
];
export const typesSPA = ['spa', 'reactspa', 'react-spa'];

// 打包 DLL 相关
export const keyConfigBuildDll = '__BUILD_DLL__';
export const filenameDll = '.dll.js';
export const filenameDllManifest = '.dll.manifest.json';
export const dirDll = 'dev-dll';

// 其他项目配置项名
export const keyConfigQuiet = '__QUIET__';
export const keyConfigOutputPathShouldBe = '__OUTPUT_PATH_SHOULD_BE__';
export const keyConfigWebpackSPATemplateInject =
    '__KOOT_WEBPACK_CONFIG_FOR_SPA_TEMPLATE_INJECT__';
export const keyConfigWebpackLocaleId = '__KOOT_WEBPACK_CONFIG_LOCALE_ID__';
export const keyConfigWebpackSPAServer = '__SPA_SERVER__';
export const keyConfigClientAssetsPublicPath = '__CLIENT_ASSETS_PUBLIC_PATH__';
export const keyConfigClientServiceWorkerPathname =
    '__CLIENT_SERVICE_WORKER_PATHNAME__';
export const keyConfigIcons = '__APP_ICONS__';
export const keyConfigOriginalFull = '__ORIGINAL__';
export const WEBPACK_OUTPUT_PATH = '__WEBPACK_OUTPUT_PATH';
export const CLIENT_ROOT_PATH = '__CLIENT_ROOT_PATH';
export const WEBPACK_MODIFIED_PUBLIC_PATH = '__WEBPACK_MODIFIED_PUBLIC_PATH';
// export const CLEANUP_PREVIOUS_BUILDS_IDS= '__CLEANUP_PREVIOUS_BUILDS_IDS'
// export const CLEANUP_PREVIOUS_BUILDS_FILES= '__CLEANUP_PREVIOUS_BUILDS_FILES'

// 自定义 chunk
export const chunkNameExtractCss = '__KOOT__EXTRACT__CSS__';
export const chunkNameExtractCssForImport =
    '__KOOT__EXTRACT__CSS__NO__PUBLIC__PATH__';
export const chunkNameClientRunFirst = '__KOOT__CLIENT__RUN__FIRST__';
/** Asset Module 默认文件名 */
export const defaultAssetModuleFilename = 'asset.[hash][ext][query]';

// [开发环境] 临时文件名
export const filenameWebpackDevServerPortTemp = '.dev_webpack-dev-server_port';
export const filenameBuilding = '.koot-building';
export const filenameBuildFail = '.koot-build-fail';
export const filenameSPATemplateInjectJS = '.spa-template-inject.LOCALEID.js';

// [生产环境] 文件名
// export const filenameCurrentBundle= '.koot-current'

// 标签属性
export const styleTagGlobalAttributeName = 'data-koot-global';
export const styleTagModuleAttributeName = 'data-koot-module';
export const scriptTagEntryAttributeName = 'data-koot-entry';

// 模板中的一些判断阈值
/**
 * @type {number} 全局 CSS 抽出总结果文件尺寸阈值 (字节)
 * - 如果超过这个值，会采用 <link> 引用的方式
 * - 如果小于等于这个值，直接将文件内容写入 HTML
 */
export const thresholdStylesExtracted = 50 * 1024;
/**
 * @type {number} run-first 入口的文件尺寸阈值 (字节)
 * - 如果超过这个值，会采用 <script> 引用的方式
 * - 如果小于等于这个值，直接将文件内容写入 HTML
 */
export const thresholdScriptRunFirst = 15 * 1024;

/** @type {string} 打包结果目录中的文件对照表文件名 */
export const buildManifestFilename = '.koot-public-manifest.json';
/** @type {string} 打包结果目录中输出文件总集文件名 */
export const buildOutputsFilename = '.koot-public-outputs.json';

/** @type {string} Webpack Dev Server 热更新 Web Socket 地址 */
export const pathnameSockjs = `sockjs-node`;

/** Webpack compilation 对象中的定制属性 - 额外 Meta 标签的 HTML 代码 */
export const compilationKeyHtmlMetaTags = '.htmlMetaTags__';

/** 针对 SPA 打包时模板 injection 操作需要的 Webpack compilation 对象对应的全局变量名 */
export const GLOBAL_VAR_BUILD_COMPILATION_FOR_SPA_INJECTION =
    '__KOOT_GLOBAL_VAR_BUILD_COMPILATION_FOR_SPA_INJECTION__';

/** Qiankun 打包 Entrypoint */
export const entrypointQiankun = 'koot-qiankun-entry';

/**
 * Webpack 打包相关的常量，包括：
 * - 文件名
 * - 代码中使用的临时常量名
 * - `koot.config.js` 的属性名
 * - 其他代码中用到的常量名
 */
export default {
    keyFileProjectConfigTempFull,
    keyFileProjectConfigTempPortionServer,
    keyFileProjectConfigTempPortionClient,
    keyFileProjectConfigTempPortionOtherClient,
    keyKootBaseVersion,
    dirConfigTemp,
    filenameProjectConfigTempFull,
    filenameProjectConfigTempPortionServer,
    filenameProjectConfigTempPortionClient,
    filenameProjectConfigTempPortionOtherClient,
    propertiesToExtract,
    typesSPA,

    keyConfigBuildDll,
    filenameDll,
    filenameDllManifest,
    dirDll,

    keyConfigQuiet,
    keyConfigOutputPathShouldBe,
    keyConfigWebpackSPATemplateInject,
    keyConfigWebpackLocaleId,
    keyConfigWebpackSPAServer,
    keyConfigClientAssetsPublicPath,
    keyConfigClientServiceWorkerPathname,
    keyConfigIcons,
    keyConfigOriginalFull,
    WEBPACK_OUTPUT_PATH,
    CLIENT_ROOT_PATH,
    WEBPACK_MODIFIED_PUBLIC_PATH,
    // CLEANUP_PREVIOUS_BUILDS_IDS,
    // CLEANUP_PREVIOUS_BUILDS_FILES,

    chunkNameExtractCss,
    chunkNameExtractCssForImport,
    chunkNameClientRunFirst,
    defaultAssetModuleFilename,

    filenameWebpackDevServerPortTemp,
    filenameBuilding,
    filenameBuildFail,
    filenameSPATemplateInjectJS,

    // filenameCurrentBundle,

    styleTagGlobalAttributeName,
    styleTagModuleAttributeName,
    scriptTagEntryAttributeName,

    // 模板中的一些判断阈值
    thresholdStylesExtracted,
    thresholdScriptRunFirst,

    buildManifestFilename,
    buildOutputsFilename,

    pathnameSockjs,

    compilationKeyHtmlMetaTags,

    GLOBAL_VAR_BUILD_COMPILATION_FOR_SPA_INJECTION,

    entrypointQiankun,
};
