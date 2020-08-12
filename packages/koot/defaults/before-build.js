/**
 * Webpack 打包相关的常量，包括：
 * - 文件名
 * - 代码中使用的临时常量名
 * - `koot.config.js` 的属性名
 * - 其他代码中用到的常量名
 */
module.exports = {
    // 处理项目配置相关
    keyFileProjectConfigTempFull: '__FILE_PROJECT_CONFIG_TEMP_FULL__',
    keyFileProjectConfigTempPortionServer:
        '__FILE_PROJECT_CONFIG_TEMP_PORTION_SERVER__',
    keyFileProjectConfigTempPortionClient:
        '__FILE_PROJECT_CONFIG_TEMP_PORTION_CLIENT__',
    keyFileProjectConfigTempPortionOtherClient:
        '__FILE_PROJECT_CONFIG_TEMP_PORTION_OTHER_CLIENT__',
    keyKootBaseVersion: '__KOOT_BASE_VERSION__',
    dirConfigTemp: 'logs/tmp/config',
    filenameProjectConfigTempFull: 'full.*.js',
    filenameProjectConfigTempPortionServer: 'portion.server.*.js',
    filenameProjectConfigTempPortionClient: 'portion.client.*.js',
    filenameProjectConfigTempPortionOtherClient: 'portion.client-other.*.js',
    propertiesToExtract: [
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
    ],
    typesSPA: ['spa', 'reactspa', 'react-spa'],

    // 打包 DLL 相关
    keyConfigBuildDll: '__BUILD_DLL__',
    filenameDll: '.dll.js',
    filenameDllManifest: '.dll.manifest.json',
    dirDll: 'dev-dll',

    // 其他项目配置项名
    keyConfigQuiet: '__QUIET__',
    keyConfigOutputPathShouldBe: '__OUTPUT_PATH_SHOULD_BE__',
    keyConfigWebpackSPATemplateInject:
        '__KOOT_WEBPACK_CONFIG_FOR_SPA_TEMPLATE_INJECT__',
    keyConfigWebpackSPAServer: '__SPA_SERVER__',
    keyConfigClientAssetsPublicPath: '__CLIENT_ASSETS_PUBLIC_PATH__',
    keyConfigClientServiceWorkerPathname: '__CLIENT_SERVICE_WORKER_PATHNAME__',
    keyConfigIcons: '__APP_ICONS__',
    WEBPACK_OUTPUT_PATH: '__WEBPACK_OUTPUT_PATH',
    CLIENT_ROOT_PATH: '__CLIENT_ROOT_PATH',
    WEBPACK_MODIFIED_PUBLIC_PATH: '__WEBPACK_MODIFIED_PUBLIC_PATH',
    // CLEANUP_PREVIOUS_BUILDS_IDS: '__CLEANUP_PREVIOUS_BUILDS_IDS',
    // CLEANUP_PREVIOUS_BUILDS_FILES: '__CLEANUP_PREVIOUS_BUILDS_FILES',

    // 自定义 chunk
    chunkNameExtractCss: '__KOOT__EXTRACT__CSS__',
    chunkNameExtractCssForImport: '__KOOT__EXTRACT__CSS__NO__PUBLIC__PATH__',
    chunkNameClientRunFirst: '__KOOT__CLIENT__RUN__FIRST__',

    // [开发环境] 临时文件名
    filenameWebpackDevServerPortTemp: '.dev_webpack-dev-server_port',
    filenameBuilding: '.koot-building',
    filenameBuildFail: '.koot-build-fail',
    filenameSPATemplateInjectJS: '.spa-template-inject.LOCALEID.js',

    // [生产环境] 文件名
    // filenameCurrentBundle: '.koot-current',

    // 标签属性
    styleTagGlobalAttributeName: 'data-koot-global',
    styleTagModuleAttributeName: 'data-koot-module',
    scriptTagEntryAttributeName: 'data-koot-entry',

    // 模板中的一些判断阈值
    /**
     * @type {number} 全局 CSS 抽出总结果文件尺寸阈值 (字节)
     * - 如果超过这个值，会采用 <link> 引用的方式
     * - 如果小于等于这个值，直接将文件内容写入 HTML
     */
    thresholdStylesExtracted: 50 * 1024,
    /**
     * @type {number} run-first 入口的文件尺寸阈值 (字节)
     * - 如果超过这个值，会采用 <script> 引用的方式
     * - 如果小于等于这个值，直接将文件内容写入 HTML
     */
    thresholdScriptRunFirst: 15 * 1024,

    /** @type {string} 打包结果目录中的文件对照表文件名 */
    buildManifestFilename: '.koot-public-manifest.json',
    /** @type {string} 打包结果目录中输出文件总集文件名 */
    buildOutputsFilename: '.koot-public-outputs.json',

    /** @type {string} Webpack Dev Server 热更新 Web Socket 地址 */
    pathnameSockjs: `sockjs-node`,

    /** Webpack compilation 对象中的定制属性 - 额外 Meta 标签的 HTML 代码 */
    compilationKeyHtmlMetaTags: '.htmlMetaTags__',
};
