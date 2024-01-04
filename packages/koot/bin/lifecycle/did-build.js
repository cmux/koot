require('../../typedef');

/**
 * 针对所有命令：在所有打包流程结束之后，此时会执行
 * 1. 执行项目配置的 afterBuild 生命周期方法
 * @async
 * @param {AppConfig} appConfig
 * @void
 */
module.exports = async (appConfig) => {
    if (typeof appConfig.afterBuild === 'function')
        await appConfig.afterBuild(appConfig);

    if (appConfig.target === 'electron') {
        await require('koot-electron/libs/after-build')(appConfig);
    }
};
