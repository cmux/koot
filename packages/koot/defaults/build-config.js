/* eslint-disable import/no-anonymous-default-export */

import path from 'node:path';
import getCwd from '../utils/get-cwd.js';

/**
 * 在创建 Webpack 打包配置时使用的默认值，作为 Koot App 配置的 Fallback
 */
export default {
    dist: path.resolve(getCwd(), 'dist'),
    distClientAssetsDirName: 'includes',
    config: {},
    aliases: {},
    i18n: false,
    serviceWorker: true,
    devServer: {},
    // beforeBuild: () => {},
    // afterBuild: () => {},
    port: undefined,
    defines: {},
    webpackDll: [],
    reactLegacyRef: false,
};
