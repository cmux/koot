const fs = require('fs-extra');
const path = require('path');

const validateConfigDist = require('../validate-config-dist');
const getCwd = require('../../utils/get-cwd');
const {
    keyFileProjectConfigTempFull,
    keyFileProjectConfigTempPortionServer,
    keyFileProjectConfigTempPortionClient,
    keyFileProjectConfigTempPortionOtherClient,
    filenameProjectConfigTempFull,
    filenameProjectConfigTempPortionServer,
    filenameProjectConfigTempPortionClient,
    filenameProjectConfigTempPortionOtherClient,
    propertiesToExtract: _propertiesToExtract,
    dirConfigTemp: _dirConfigTemp,
    WEBPACK_OUTPUT_PATH
} = require('../../defaults/before-build');
const log = require('../../libs/log');
const __ = require('../../utils/translate');

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
const validateConfig = async (projectDir = getCwd(), options = {}) => {
    const { configFilename = 'koot.config.js', tmpDir } = options;

    /** @type {String} 配置文件路径名 */
    const fileConfig =
        typeof process.env.KOOT_BUILD_CONFIG_PATHNAME === 'string'
            ? process.env.KOOT_BUILD_CONFIG_PATHNAME
            : path.resolve(projectDir, configFilename);

    // 如果完整配置文件不存在，报错，结束流程
    if (!fs.existsSync(fileConfig)) {
        const msg = __('validateConfig.error.config_file_not_found');
        log('error', '', msg);
        throw new Error(msg);
    }

    /** @type {Object} 完整配置 */
    const kootConfig = { ...require(fileConfig) };

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

    if (!process.env.KOOT_DEV_START_TIME)
        process.env.KOOT_DEV_START_TIME = Date.now();

    /** @type {String} 存放临时文件的目录 */
    const dirConfigTemp = tmpDir || path.resolve(projectDir, _dirConfigTemp);
    // 确保该临时目录存在
    await fs.ensureDir(dirConfigTemp);

    // 兼容性处理 (将老版本的配置转换为最新配置)
    await require('./transform-compatible/template-inject')(kootConfig);
    await require('./transform-compatible/router-related')(kootConfig);
    await require('./transform-compatible/redux-related')(kootConfig);
    await require('./transform-compatible/i18n-related')(kootConfig);
    await require('./transform-compatible/static-copy-from')(kootConfig);
    await require('./transform-compatible/client-related')(kootConfig);
    await require('./transform-compatible/server-related')(kootConfig);
    await require('./transform-compatible/webpack-related')(kootConfig);
    await require('./transform-compatible/pwa-related')(kootConfig);

    // 清理所有第一级的 undefined 项和空对象
    // 清理所有第一级的空对象
    Object.keys(kootConfig).forEach(key => {
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
    await require('./add-default-values')(projectDir, kootConfig);

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
                process.env.KOOT_PROJECT_CONFIG_PORTION_OTHER_CLIENT_PATHNAME
        };
    }

    // 代码中引用的配置文件 (存放于临时目录中)
    const {
        tmpConfig,
        tmpConfigPortionServer,
        tmpConfigPortionClient,
        tmpConfigPortionOtherClient
    } = await require('./extract-to-tmp')(projectDir, kootConfig);

    // 写入项目配置文件 (临时)
    const pathTmpConfig = path.resolve(
        dirConfigTemp,
        filenameProjectConfigTempFull.replace(
            /\*/g,
            process.env.KOOT_DEV_START_TIME
        )
    );
    process.env.KOOT_PROJECT_CONFIG_FULL_PATHNAME = pathTmpConfig;
    await fs.writeFile(pathTmpConfig, tmpConfig, 'utf-8');

    const pathTmpConfigPortionServer = path.resolve(
        dirConfigTemp,
        filenameProjectConfigTempPortionServer.replace(
            /\*/g,
            process.env.KOOT_DEV_START_TIME
        )
    );
    process.env.KOOT_PROJECT_CONFIG_PORTION_SERVER_PATHNAME = pathTmpConfigPortionServer;
    await fs.writeFile(
        pathTmpConfigPortionServer,
        tmpConfigPortionServer,
        'utf-8'
    );

    const pathTmpConfigPortionClient = path.resolve(
        dirConfigTemp,
        filenameProjectConfigTempPortionClient.replace(
            /\*/g,
            process.env.KOOT_DEV_START_TIME
        )
    );
    process.env.KOOT_PROJECT_CONFIG_PORTION_CLIENT_PATHNAME = pathTmpConfigPortionClient;
    await fs.writeFile(
        pathTmpConfigPortionClient,
        tmpConfigPortionClient,
        'utf-8'
    );

    const pathTmpConfigPortionOtherClient = path.resolve(
        dirConfigTemp,
        filenameProjectConfigTempPortionOtherClient.replace(
            /\*/g,
            process.env.KOOT_DEV_START_TIME
        )
    );
    process.env.KOOT_PROJECT_CONFIG_PORTION_OTHER_CLIENT_PATHNAME = pathTmpConfigPortionOtherClient;
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
        [keyFileProjectConfigTempPortionOtherClient]: pathTmpConfigPortionOtherClient
    };
};

// 调整构建配置对象
const finalValidate = async (config = {}) => {
    // 改变配置项: dest -> dist
    if (typeof config.dest !== 'undefined') {
        config.dist = config.dest;
        delete config.dest;
    }
    if (process.env.WEBPACK_BUILD_ENV === 'dev') {
        config.dist = require('../get-dir-dev-tmp')(undefined, 'build');
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
        Object.keys(config.webpack).forEach(key => {
            applyWebpackConfig(
                key,
                'webpack' + key.substr(0, 1).toUpperCase() + key.substr(1)
            );
        });
        delete config.webpack;
    }

    // 添加 placeholder
    config[WEBPACK_OUTPUT_PATH] = undefined;

    return config;
};

module.exports = validateConfig;
