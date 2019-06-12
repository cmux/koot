/**
 * Webpack 打包相关的常量，包括：
 * - 文件名
 * - 代码中使用的临时常量名
 * - `koot.config.js` 的属性名
 */
module.exports = {
    // 处理项目配置相关
    keyFileProjectConfigTempFull: '__FILE_PROJECT_CONFIG_TEMP_FULL__',
    keyFileProjectConfigTempPortionServer:
        '__FILE_PROJECT_CONFIG_TEMP_PORTION_SERVER__',
    keyFileProjectConfigTempPortionClient:
        '__FILE_PROJECT_CONFIG_TEMP_PORTION_CLIENT__',
    dirConfigTemp: 'logs/tmp/config',
    filenameProjectConfigTempFull: 'full.*.js',
    filenameProjectConfigTempPortionServer: 'portion.server.*.js',
    filenameProjectConfigTempPortionClient: 'portion.client.*.js',
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
        ['server', {}]
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
    keyConfigWebpackSPATemplateInject: '__SPA_TEMPLATE_INJECT__',
    WEBPACK_OUTPUT_PATH: '__WEBPACK_OUTPUT_PATH',
    CLIENT_ROOT_PATH: '__CLIENT_ROOT_PATH',

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
    filenameCurrentBundle: '.koot-current'
};
