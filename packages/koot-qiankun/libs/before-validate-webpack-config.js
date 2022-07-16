/* eslint-disable no-console */

const __ = require('./translate');

const defaultQiankunConfig = require('./defaults/qiankun-config');

// ============================================================================

const modifyConfig = async (appConfig) => {
    // if (appConfig[keyConfigBuildDll]) return;

    if (typeof appConfig !== 'object')
        throw new Error('MISSING_PARAMETER: appConfig');

    // ========================================================================
    //
    // 生成 Qiankun 配置对象
    //
    // ========================================================================
    const qiankunConfig = {
        ...(appConfig.qiankun || {}),
        ...defaultQiankunConfig,
    };
    if (!qiankunConfig.name)
        throw new Error(__('MISSING_CONFIG: `qiankun.name`'));
    if (qiankunConfig.basename && !process.env.KOOT_HISTORY_BASENAME) {
        process.env.KOOT_HISTORY_BASENAME = qiankunConfig.basename;
    }

    appConfig.qiankun = qiankunConfig;

    return appConfig;
};

module.exports = modifyConfig;
