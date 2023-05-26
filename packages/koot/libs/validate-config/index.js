import fs from 'fs-extra';
import path from 'node:path';
import md5 from 'md5';
import merge from 'lodash/merge';

import transformCompatibleTemplateInject from './transform-compatible/template-inject.js';
import transformCompatibleRouterRelated from './transform-compatible/router-related.js';
import transformCompatibleReduxRelated from './transform-compatible/redux-related.js';
import transformCompatibleI18nRelated from './transform-compatible/i18n-related.js';
import transformCompatibleStaticCopyFrom from './transform-compatible/static-copy-from.js';
import transformCompatibleClientRelated from './transform-compatible/client-related.js';
import transformCompatibleServerRelated from './transform-compatible/server-related.js';
import transformCompatibleWebpackRelated from './transform-compatible/webpack-related.js';
import transformCompatibleWebappRelated from './transform-compatible/webapp-related.js';
import addDefaultValues from './add-default-values.js';
import extractToTmp from './extract-to-tmp.js';

import validateConfigDist from '../validate-config-dist.js';
import getDirDevTmp from '../get-dir-dev-tmp.js';
import getCwd from '../../utils/get-cwd.js';
import {
    keyFileProjectConfigTempFull,
    keyFileProjectConfigTempPortionServer,
    keyFileProjectConfigTempPortionClient,
    keyFileProjectConfigTempPortionOtherClient,
    filenameProjectConfigTempFull,
    filenameProjectConfigTempPortionServer,
    filenameProjectConfigTempPortionClient,
    filenameProjectConfigTempPortionOtherClient,
    propertiesToExtract as _propertiesToExtract,
    dirConfigTemp as _dirConfigTemp,
    WEBPACK_OUTPUT_PATH,
    keyConfigOriginalFull,
} from '../../defaults/before-build.js';
import { KOOT_DEV_START_TIME } from '../../defaults/envs.js';
import { scopeNeedTransformPathname } from '../../defaults/defines-service-worker.js';
import log from '../../libs/log.js';
import __ from '../../utils/translate.js';
import getAppConfig from '../../utils/get-app-config.js';
// import isSPA from './is-spa.js';

/**
 * 根据 koot.config.js 生成 koot.js 和打包配置对象，并将必要信息写入环境变量
 *
 * 根据以下优先级查找配置文件
 * 1. `process.env.KOOT_BUILD_CONFIG_PATHNAME`
 * 2. 项目根目录下指定的文件
 * 2. 项目根目录下的 `koot.config.js`
 *
 * 以下内容写入环境变量
 * - `KOOT_PROJECT_CONFIG_FULL_PATHNAME` 项目配置文件路径，包含所有需要引用的内容 (临时使用)
 * - `KOOT_PROJECT_CONFIG_PORTION_SERVER_PATHNAME` 项目配置文件路径，包含部分需要引用的内容 (服务器端临时使用)
 * - `KOOT_PROJECT_CONFIG_PORTION_CLIENT_PATHNAME` 项目配置文件路径，包含部分需要引用的内容 (客户端临时使用)
 * - `KOOT_PROJECT_CONFIG_PORTION_OTHER_CLIENT_PATHNAME` 项目配置文件路径，包含部分其他需要引用的内容 (客户端临时使用)
 *
 * 兼容情况
 * - _0.8_: 当前版本
 * - _0.6_: 完全兼容
 * - _更早期_: 已放弃兼容
 *
 * @async
 * @param {String} [projectDir] 项目根目录
 * @param {Object} [options={}]
 * @param {String} [options.configFilename=koot.config.js] 配置文件文件名
 * @param {String} [options.tmpDir] 存放临时文件的目录
 * @returns {Object} 打包配置对象
 */
const validateConfig = async (projectDir, options = {}) => {
    const { configFilename = 'koot.config.js', tmpDir } = options;

    if (projectDir) {
        process.env.KOOT_CWD = projectDir;
    } else {
        projectDir = getCwd();
    }

    /** @type {String} 配置文件路径名 */
    const fileConfig =
        typeof process.env.KOOT_BUILD_CONFIG_PATHNAME === 'string'
            ? process.env.KOOT_BUILD_CONFIG_PATHNAME
            : path.isAbsolute(configFilename)
            ? configFilename
            : path.resolve(projectDir, configFilename);

    // 如果完整配置文件不存在，报错，结束流程
    if (!fs.existsSync(fileConfig)) {
        const msg = __('validateConfig.error.config_file_not_found');
        log('error', '', msg);
        throw new Error(msg);
    }

    /** @type {Object} 完整配置 */
    const kootConfig = { ...(await getAppConfig(fileConfig)) };

    /** @type {Array} 需要抽取到项目配置中的项 */
    const propertiesToExtract = [..._propertiesToExtract];

    // 如果目标配置文件为旧版本，报错，结束流程
    if (
        !propertiesToExtract.some(
            ([key]) => typeof kootConfig[key] !== 'undefined'
        )
    ) {
        const msg = __('validateConfig.error.config_file_old');
        log('error', '', msg);
        throw new Error(msg);
    }

    if (!process.env[KOOT_DEV_START_TIME])
        process.env[KOOT_DEV_START_TIME] = Date.now();

    /** @type {String} 存放临时文件的目录 */
    const dirConfigTemp = tmpDir || path.resolve(projectDir, _dirConfigTemp);
    // 确保该临时目录存在
    await fs.ensureDir(dirConfigTemp);

    // 处理前的配置
    kootConfig[keyConfigOriginalFull] = merge({}, kootConfig);

    // 兼容性处理 (将老版本的配置转换为最新配置)
    await transformCompatibleTemplateInject(kootConfig);
    await transformCompatibleRouterRelated(kootConfig);
    await transformCompatibleReduxRelated(kootConfig);
    await transformCompatibleI18nRelated(kootConfig);
    await transformCompatibleStaticCopyFrom(kootConfig);
    await transformCompatibleClientRelated(kootConfig);
    await transformCompatibleServerRelated(kootConfig);
    await transformCompatibleWebpackRelated(kootConfig);
    await transformCompatibleWebappRelated(kootConfig);

    // 清理所有第一级的 undefined 项和空对象
    // 清理所有第一级的空对象
    Object.keys(kootConfig).forEach((key) => {
        if (typeof kootConfig[key] === 'undefined') delete kootConfig[key];
        // if (Array.isArray(kootConfig[key]) && !kootConfig[key].length)
        //     delete kootConfig[key]
        if (
            typeof kootConfig[key] === 'object' &&
            !Array.isArray(kootConfig[key]) &&
            !(kootConfig[key] instanceof RegExp) &&
            !Object.keys(kootConfig[key]).length
        )
            delete kootConfig[key];
    });

    // 处理默认值
    await addDefaultValues(projectDir, kootConfig);

    // 如果定制了配置文件路径，直接返回结果
    if (typeof process.env.KOOT_PROJECT_CONFIG_FULL_PATHNAME === 'string') {
        return {
            ...(await finalValidate(kootConfig)),
            [keyFileProjectConfigTempFull]:
                process.env.KOOT_PROJECT_CONFIG_FULL_PATHNAME,
            [keyFileProjectConfigTempPortionServer]:
                process.env.KOOT_PROJECT_CONFIG_PORTION_SERVER_PATHNAME,
            [keyFileProjectConfigTempPortionClient]:
                process.env.KOOT_PROJECT_CONFIG_PORTION_CLIENT_PATHNAME,
            [keyFileProjectConfigTempPortionOtherClient]:
                process.env.KOOT_PROJECT_CONFIG_PORTION_OTHER_CLIENT_PATHNAME,
        };
    }

    // 代码中引用的配置文件 (存放于临时目录中)
    const {
        tmpConfig,
        tmpConfigPortionServer,
        tmpConfigPortionClient,
        tmpConfigPortionOtherClient,
    } = await extractToTmp(projectDir, kootConfig);

    // 写入项目配置文件 (临时)
    const pathTmpConfig = path.resolve(
        dirConfigTemp,
        filenameProjectConfigTempFull.replace(
            /\*/g,
            // process.env[KOOT_DEV_START_TIME]
            md5(tmpConfig)
        )
    );
    process.env.KOOT_PROJECT_CONFIG_FULL_PATHNAME = pathTmpConfig;
    await fs.writeFile(pathTmpConfig, tmpConfig, 'utf-8');

    const pathTmpConfigPortionServer = path.resolve(
        dirConfigTemp,
        filenameProjectConfigTempPortionServer.replace(
            /\*/g,
            // process.env[KOOT_DEV_START_TIME]
            md5(tmpConfigPortionServer)
        )
    );
    process.env.KOOT_PROJECT_CONFIG_PORTION_SERVER_PATHNAME =
        pathTmpConfigPortionServer;
    await fs.writeFile(
        pathTmpConfigPortionServer,
        tmpConfigPortionServer,
        'utf-8'
    );

    const pathTmpConfigPortionClient = path.resolve(
        dirConfigTemp,
        filenameProjectConfigTempPortionClient.replace(
            /\*/g,
            // process.env[KOOT_DEV_START_TIME]
            md5(tmpConfigPortionClient)
        )
    );
    process.env.KOOT_PROJECT_CONFIG_PORTION_CLIENT_PATHNAME =
        pathTmpConfigPortionClient;
    await fs.writeFile(
        pathTmpConfigPortionClient,
        tmpConfigPortionClient,
        'utf-8'
    );

    const pathTmpConfigPortionOtherClient = path.resolve(
        dirConfigTemp,
        filenameProjectConfigTempPortionOtherClient.replace(
            /\*/g,
            // process.env[KOOT_DEV_START_TIME]
            md5(tmpConfigPortionOtherClient)
        )
    );
    process.env.KOOT_PROJECT_CONFIG_PORTION_OTHER_CLIENT_PATHNAME =
        pathTmpConfigPortionOtherClient;
    await fs.writeFile(
        pathTmpConfigPortionOtherClient,
        tmpConfigPortionOtherClient,
        'utf-8'
    );

    return {
        ...(await finalValidate(kootConfig)),
        [keyFileProjectConfigTempFull]: pathTmpConfig,
        [keyFileProjectConfigTempPortionServer]: pathTmpConfigPortionServer,
        [keyFileProjectConfigTempPortionClient]: pathTmpConfigPortionClient,
        [keyFileProjectConfigTempPortionOtherClient]:
            pathTmpConfigPortionOtherClient,
    };
};

// 调整构建配置对象
const finalValidate = async (config = {}) => {
    const isSPA =
        /spa$/.test(config.type || '') ||
        process.env.WEBPACK_BUILD_TYPE === 'spa';

    // 改变配置项: dest -> dist
    if (typeof config.dest !== 'undefined') {
        config.dist = config.dest;
        delete config.dest;
    }
    if (process.env.WEBPACK_BUILD_ENV === 'dev') {
        config.dist = getDirDevTmp(undefined, 'build');
    }
    if (typeof config.dist !== 'undefined') {
        validateConfigDist(config.dist);
    }

    // 改变配置项: webpack.config -> config
    if (typeof config.webpack === 'object') {
        /**
         * 将配置中的 webpack 对象内的内容应用到配置对象顶层
         * @param {String} nameInObject
         * @param {String} nameAfter
         */
        const applyWebpackConfig = (nameInObject, nameAfter) => {
            if (typeof config.webpack[nameInObject] !== 'undefined') {
                config[nameAfter] = config.webpack[nameInObject];
                delete config.webpack[nameInObject];
            }
        };
        applyWebpackConfig('config', 'config');
        applyWebpackConfig('beforeBuild', 'beforeBuild');
        applyWebpackConfig('afterBuild', 'afterBuild');
        applyWebpackConfig('defines', 'defines');
        applyWebpackConfig('dll', 'webpackDll');
        applyWebpackConfig('hmr', 'webpackHmr');
        applyWebpackConfig('compilerHook', 'webpackCompilerHook');
        Object.keys(config.webpack).forEach((key) => {
            applyWebpackConfig(
                key,
                'webpack' + key.substr(0, 1).toUpperCase() + key.substr(1)
            );
        });
        delete config.webpack;
    }

    // Electron 相关默认值
    if (/electron/i.test(config.type || '')) {
        config.type = /^react/i.test(config.type)
            ? 'react-spa'
            : /^electron/i.test(config.type)
            ? 'react-spa'
            : config.type.split('electron').join('-').replace(/-+/g, '-');
        if (!/spa$/.test(config.type || ''))
            config.type = (config.type + '-spa').replace(/-+/g, '-');
        config.target = 'electron';
    }

    // historyType 默认值
    if (!config.historyType) {
        config.historyType = isSPA ? 'hash' : 'browser';
    }

    // SPA 相关默认值
    if (isSPA) {
        process.env.WEBPACK_BUILD_TYPE = 'spa';
    }

    // 配置项: serverless
    if (config.serverless === true) {
        config.target = 'serverless';
        delete config.serverless;
    }

    // Service Worker scope 默认值
    // 需要在 historyType 最终确定后进行
    if (
        /^hash/.test(config.historyType) &&
        (typeof config.serviceWorker !== 'object' ||
            !config.serviceWorker.scope ||
            config.serviceWorker.scope === '/')
    ) {
        if (typeof config.serviceWorker !== 'object') config.serviceWorker = {};
        config.serviceWorker.scope = scopeNeedTransformPathname;
    }

    switch (config.target) {
        case 'serverless': {
            if (
                process.env.WEBPACK_BUILD_TYPE === 'isomorphic' ||
                config.type === 'react' ||
                config.type === 'react-app'
            ) {
                process.env.KOOT_BUILD_TARGET = 'serverless';
                if (typeof config.serverPackAll === 'undefined') {
                    config.serverPackAll = true;
                }
            }
            break;
        }
        case 'electron': {
            if (isSPA) {
                process.env.KOOT_PROJECT_TYPE = 'ReactElectronSPA';
                process.env.KOOT_BUILD_TARGET = 'electron';
            }
            break;
        }
        case 'qiankun': {
            if (isSPA) {
                process.env.KOOT_PROJECT_TYPE = 'ReactQiankunSPA';
                process.env.KOOT_BUILD_TARGET = 'qiankun';
            }
            break;
        }
        default: {
        }
    }

    if (config.target !== 'electron') {
        delete config.electron;
    }

    /**
     * `webApp` - 添加默认值
     */
    if (typeof config.webApp === 'object') {
        if (!config.webApp.name) config.webApp.name = config.name;
    }

    // 添加 placeholder
    config[WEBPACK_OUTPUT_PATH] = undefined;

    return config;
};

export default validateConfig;
