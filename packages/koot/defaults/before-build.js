module.exports = {
    // 处理项目配置相关
    keyFileProjectConfigTemp: '__FILE_PROJECT_CONFIG_TEMP__',
    filenameProjectConfigTemp: '.koot.config.tmp.*.js',
    propertiesToExtract: [
        ['name', ''],
        ['type', 'react'],
        ['template', ''],
        ['router', ''],
        ['redux', {}],
        ['client', {}],
        ['server', {}]
    ],

    // 打包 DLL 相关
    keyConfigBuildDll: '__BUILD_DLL__',
    filenameDll: '.dll.js',
    filenameDllManifest: '.dll.manifest.json',
    dirDll: 'dev-dll',

    // 其他项目配置项名
    keyConfigQuiet: '__QUIET__',
    keyConfigOutputPathShouldBe: '__OUTPUT_PATH_SHOULD_BE__',

    // [开发模式] 临时文件名
    filenameWebpackDevServerPortTemp: '.dev_webpack-dev-server_port',
    filenameBuilding: '.koot-building',
    filenameBuildFail: '.koot-build-fail'
}
