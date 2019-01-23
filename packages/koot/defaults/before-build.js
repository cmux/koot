/**
 * Webpack 打包相关
 */
module.exports = {
    // 处理项目配置相关
    keyFileProjectConfigTempFull: '__FILE_PROJECT_CONFIG_TEMP_FULL__',
    keyFileProjectConfigTempPortionServer: '__FILE_PROJECT_CONFIG_TEMP_PORTION_SERVER__',
    keyFileProjectConfigTempPortionClient: '__FILE_PROJECT_CONFIG_TEMP_PORTION_CLIENT__',
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
    typesSPA: [
        'spa',
        'reactspa',
        'react-spa'
    ],

    // 打包 DLL 相关
    keyConfigBuildDll: '__BUILD_DLL__',
    filenameDll: '.dll.js',
    filenameDllManifest: '.dll.manifest.json',
    dirDll: 'dev-dll',

    // 其他项目配置项名
    keyConfigQuiet: '__QUIET__',
    keyConfigOutputPathShouldBe: '__OUTPUT_PATH_SHOULD_BE__',

    // 自定义 chunk
    chunkNameExtractCss: '__KOOT__EXTRACT__CSS__',
    chunkNameClientRunFirst: '__KOOT__CLIENT__RUN__FIRST__',

    // [开发环境] 临时文件名
    filenameWebpackDevServerPortTemp: '.dev_webpack-dev-server_port',
    filenameBuilding: '.koot-building',
    filenameBuildFail: '.koot-build-fail'
}
