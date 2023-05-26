/* eslint-disable import/no-anonymous-default-export */

/**
 * Koot.js app 配置项 `serviceWorker` 默认值
 */
export default {
    auto: true,
    filename: 'service-worker.js',
    // scope: '/', // 生成 webpack 配置时，根据是否是 SPA 动态设置该默认值
    include: [],
    exclude: [],
};
