/* eslint-disable import/no-anonymous-default-export */

import '../../typedef.js';

/**
 * 针对所有命令：在所有打包流程结束之后，此时会执行
 * 1. 执行项目配置的 afterBuild 生命周期方法
 * @async
 * @param {AppConfig} appConfig
 * @void
 */
export default async (appConfig) => {
    if (typeof appConfig.afterBuild === 'function')
        await appConfig.afterBuild(appConfig);
};
