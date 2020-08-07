const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp');
const md5 = require('md5');

const { keyConfigIcons } = require('../../../defaults/before-build');
const defaultsServiceWorker = require('../../../defaults/service-worker');
const defaultsWebApp = require('../../../defaults/web-app');
const getTmp = require('../../../libs/get-dir-dev-tmp');
const getCwd = require('../../../utils/get-cwd');

/**
 * 配置转换 - 兼容性处理 - ServiceWorker 和 PWA 相关
 * - pwa
 * - serviceWorker
 * @async
 * @param {Object} config
 * @void
 */
module.exports = async (config) => {
    // ========================================================================
    // 旧配置项处理: pwa
    // ========================================================================
    if (
        typeof config.pwa !== 'undefined' &&
        typeof config.serviceWorker === 'undefined'
    ) {
        config.serviceWorker = config.pwa;
    }
    delete config.pwa;

    // ========================================================================
    // 默认值处理: serviceWorker
    // 旧配置项处理: serviceWorker
    // ========================================================================
    if (typeof config.serviceWorker === 'object') {
        const {
            // 移除的项
            pathname,
            initialCacheAppend,
            initialCacheIgonre,

            // 可用项
            filename,
            include,
            exclude,
        } = config.serviceWorker;

        if (!!pathname && !filename) {
            config.serviceWorker.filename =
                pathname.substr(0, 1) === '/' ? pathname.substr(1) : pathname;
        }

        if (!!initialCacheAppend) {
            if (typeof include === 'undefined') {
                config.serviceWorker.include = [];
            } else if (!Array.isArray(include)) {
                config.serviceWorker.include = [include];
            }
            config.serviceWorker.include = config.serviceWorker.include.concat(
                initialCacheAppend
            );
        }

        if (!!initialCacheIgonre) {
            if (typeof exclude === 'undefined') {
                config.serviceWorker.exclude = [];
            } else if (!Array.isArray(exclude)) {
                config.serviceWorker.exclude = [exclude];
            }
            config.serviceWorker.exclude = config.serviceWorker.exclude.concat(
                initialCacheIgonre
            );
        }

        delete config.serviceWorker.pathname;
        delete config.serviceWorker.initialCacheAppend;
        delete config.serviceWorker.initialCacheIgonre;

        config.serviceWorker = Object.assign(
            {},
            defaultsServiceWorker,
            config.serviceWorker
        );
    } else if (config.serviceWorker === true) {
        config.serviceWorker = { ...defaultsServiceWorker };
    } else if (typeof config.serviceWorker === 'undefined') {
        config.serviceWorker = { ...defaultsServiceWorker };
    }

    // ========================================================================
    // 默认值处理: icon
    // ========================================================================
    if (typeof config.icon !== 'string' && typeof config.icon !== 'object')
        delete config.icon;
    else await validateIconAndGenerateFiles(config);

    // ========================================================================
    // 默认值处理: webApp
    // ========================================================================
    if (typeof config.icon === 'undefined') {
        config.webApp = false;
    } else if (typeof config.webApp === 'object' || config.webApp === true) {
        config.webApp = {
            ...defaultsWebApp,
            name: config.name,
            ...(config.webApp || {}),
        };
    }

    return config;
};

// ============================================================================

const validateIconAndGenerateFiles = async (appConfig) => {
    const { icon } = appConfig;
    const icons = {
        // original: '',
        // square: '',
        // 'x180': '',
        // 'x192': '',
        // 'x512': '',
    };
    const cwd = getCwd();
    const folder = getTmp(undefined, 'icons');

    // const resizeAndSave = async (file, size) => {
    //     const buffer = await sharp(await fs.readFile(file))
    //         .resize(size, size)
    //         .toBuffer();
    //     const filename = md5(buffer) + path.extname(file);
    //     const target = path.resolve(folder, filename);
    //     await fs.writeFile(target, buffer);
    //     icons[`x${size}`] = target;
    // };

    await fs.ensureDir(folder);
    await fs.emptyDir(folder);

    if (typeof icon === 'string') {
        const file = path.resolve(cwd, icon);
        if (!fs.existsSync(file)) return appConfig;
        // await Promise.all([
        //     await resizeAndSave(file, 180),
        //     await resizeAndSave(file, 192),
        //     await resizeAndSave(file, 512),
        // ]);

        // 添加源文件
        {
            const filename = md5(await fs.readFile(file)) + path.extname(file);
            const target = path.resolve(folder, filename);
            await fs.copy(file, target);
            icons.original = target;
        }

        // 添加方形
        {
            const image = await sharp(await fs.readFile(file));
            const { width, height } = await image.metadata();
            const buffer = await image
                .resize(Math.min(width, height), Math.min(width, height))
                .toBuffer();
            const filename = md5(buffer) + path.extname(file);
            const target = path.resolve(folder, filename);
            await fs.writeFile(target, buffer);
            icons.square = target;
        }
    } else if (typeof icon === 'object') {
    } else {
        return appConfig;
    }

    appConfig[keyConfigIcons] = icons;

    return appConfig;
};
