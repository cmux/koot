/* eslint-disable import/no-anonymous-default-export */

import '../../typedef.js';

import { KOOT_BUILD_START_TIME } from '../../defaults/envs.js';
import safeguard from '../../libs/safeguard/index.js';

/**
 * 针对所有命令：在正式开始打包之前，此时会执行
 * 1. 添加环境变量 KOOT_BUILD_START_TIME，确认打包流程开始时间
 * 2. 执行 SafeGuard，确保项目关键的 NPM 包版本和一些目录结构
 * 3. 执行项目配置的 beforeBuild 生命周期方法
 * 过程内如果出现错误，流程应该终止
 * @async
 * @param {AppConfig} appConfig
 * @void
 */
export default async (appConfig) => {
    if (!process.env[KOOT_BUILD_START_TIME])
        process.env[KOOT_BUILD_START_TIME] = Date.now() + '';

    await safeguard(appConfig);

    if (typeof appConfig.beforeBuild === 'function')
        await appConfig.beforeBuild(appConfig);
};
