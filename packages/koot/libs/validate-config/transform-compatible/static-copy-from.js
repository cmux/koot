/* eslint-disable import/no-anonymous-default-export */
import '../../../typedef.js';

/**
 * 配置转换 - 兼容性处理 - staticCopyFrom
 * @async
 * @param {AppConfig} config
 * @void
 */
export default async (config) => {
    if (typeof config.staticCopyFrom !== 'undefined') {
        delete config.staticAssets;
    } else {
        config.staticCopyFrom = config.staticAssets;
        delete config.staticAssets;
    }

    if (config.staticCopyFrom && !Array.isArray(config.staticCopyFrom)) {
        config.staticCopyFrom = [config.staticCopyFrom];
    }
};
