const fs = require('fs-extra');
const path = require('path');
const semver = require('semver');
const { InjectManifest } = require('workbox-webpack-plugin');

const {
    keyKootBaseVersion,
    keyConfigClientServiceWorkerPathname
} = require('koot/defaults/before-build');
const defaults = require('koot/defaults/service-worker');
const {
    publicPathPrefix: devPublicPathPrefix,
    serviceWorkerFilename
} = require('koot/defaults/webpack-dev-server');
const getSWFilename = require('koot/utils/get-sw-filename');

// ============================================================================

/**
 * 生成 Webpack Plugin: InjectManifest 所用配置
 */
module.exports = async (
    kootConfigForThisBuild,
    localeId,
    isPublicPathProvided = false
) => {
    if (!kootConfigForThisBuild) throw new Error('NO_KOOT_BUILD_CONFIG');

    let { serviceWorker } = kootConfigForThisBuild;

    if (serviceWorker === true) serviceWorker = {};
    if (serviceWorker === false) return;

    const { distClientAssetsDirName } = kootConfigForThisBuild;

    // Parse config ===========================================================
    const {
        filename,
        swSrc: _swSrc,
        include = [],
        exclude = [],

        // cache strategies
        cacheFirst = [],
        networkFirst = [],
        networkOnly = [],

        ...rest
    } = Object.assign({}, defaults, serviceWorker);
    ['auto', 'importWorkboxFrom', 'importsDirectory'].forEach(
        key => delete rest[key]
    );

    const isDev = process.env.WEBPACK_BUILD_ENV === 'dev';

    const inject = async (kootConfigForThisBuild, localeId) => {
        const ENV = process.env.WEBPACK_BUILD_ENV;

        const {
            [keyKootBaseVersion]: kootBaseVersion,
            distClientAssetsDirName
        } = kootConfigForThisBuild;

        const obj = {
            distClientAssetsDirName:
                ENV === 'dev' ? devPublicPathPrefix : distClientAssetsDirName,
            '__baseVersion_lt_0.12': kootBaseVersion
                ? semver.lt(kootBaseVersion, '0.12.0')
                : false,
            cacheFirst,
            networkFirst,
            networkOnly,
            env: {
                WEBPACK_BUILD_ENV: ENV
            }
        };

        if (localeId) obj.localeId = localeId;

        return `\rself.__koot = ${JSON.stringify(obj, undefined, 4)}\r\r`;
    };

    const swDest = isDev
        ? serviceWorkerFilename
        : getSWFilename(filename, localeId);

    const swSrc = await (async () => {
        if (_swSrc) return _swSrc;

        const templateBase = path.resolve(
            __dirname,
            `new-plugin-workbox-template.js`
        );
        const templateTemp = path.resolve(
            __dirname,
            '.tmp',
            `new-plugin-workbox-template${localeId ? `.${localeId}` : ''}.js`
        );

        if (fs.existsSync(templateTemp)) fs.removeSync(templateTemp);
        fs.ensureDirSync(path.dirname(templateTemp));
        fs.writeFileSync(
            templateTemp,
            (await inject(kootConfigForThisBuild, localeId)) +
                fs
                    .readFileSync(templateBase, 'utf-8')
                    .replace(
                        /__DIST_CLIENT_ASSETS_DIRNAME__/,
                        distClientAssetsDirName
                    ),
            'utf-8'
        );

        return templateTemp;
    })();

    kootConfigForThisBuild[keyConfigClientServiceWorkerPathname] = swDest;

    return new InjectManifest({
        ...rest,
        swDest,
        swSrc,
        include: [/\.js$/, /extract\.all\..+?\.large\.css$/, ...include],
        exclude: [/\.map$/, /^manifest.*\.js$/, ...exclude]
    });
};

// ============================================================================
