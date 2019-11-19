const fs = require('fs-extra');
const path = require('path');
const semver = require('semver');
const { InjectManifest } = require('workbox-webpack-plugin');

const {
    keyKootBaseVersion,
    keyConfigClientServiceWorkerPathname
} = require('koot/defaults/before-build');
const defaults = require('koot/defaults/pwa');
const getSWFilename = require('koot/utils/get-sw-filename');

// ============================================================================

module.exports = async (kootConfigForThisBuild, localeId) => {
    if (!kootConfigForThisBuild) throw new Error('NO_KOOT_BUILD_CONFIG');

    let { pwa } = kootConfigForThisBuild;

    if (pwa === true) pwa = {};
    if (pwa === false) return;

    const { distClientAssetsDirName } = kootConfigForThisBuild;

    const {
        // auto,
        // pathname,
        filename,
        template,
        // initialCache,
        initialCacheAppend = [],
        initialCacheIgonre = []
    } = Object.assign({}, defaults, pwa);

    const isDev = process.env.WEBPACK_BUILD_ENV === 'dev';

    const swDest = `${isDev ? '' : '../'}${getSWFilename(filename, localeId)}`;

    const swSrc = await (async () => {
        if (template) return template;

        const filename = 'new-plugin-workbox-template.js';
        const file = path.resolve(__dirname, '.tmp', filename);

        if (fs.existsSync(file)) fs.removeSync(file);
        fs.ensureDirSync(path.dirname(file));
        fs.writeFileSync(
            file,
            (await inject(kootConfigForThisBuild)) +
                fs
                    .readFileSync(path.resolve(__dirname, filename), 'utf-8')
                    .replace(
                        /__DIST_CLIENT_ASSETS_DIRNAME__/,
                        distClientAssetsDirName
                    ),
            'utf-8'
        );

        return file;
    })();

    kootConfigForThisBuild[keyConfigClientServiceWorkerPathname] = swDest;

    return new InjectManifest({
        swDest,
        swSrc,
        importWorkboxFrom: isDev ? 'cdn' : 'local',
        include: [/\.js$/, /\.css$/, ...initialCacheAppend],
        exclude: [/extract\.\d+\..+?\.css$/, ...initialCacheIgonre],
        importsDirectory: isDev ? '' : `__workbox-assets`
    });
};

// ============================================================================

const inject = async kootConfigForThisBuild => {
    const {
        [keyKootBaseVersion]: kootBaseVersion,
        distClientAssetsDirName
    } = kootConfigForThisBuild;

    const obj = {
        distClientAssetsDirName,
        '__baseVersion_lt_0.12': semver.lt(kootBaseVersion, '0.12.0'),
        env: {
            WEBPACK_BUILD_ENV: process.env.WEBPACK_BUILD_ENV
        }
    };

    return `\rself.__koot = ${JSON.stringify(obj, undefined, 4)}\r\r`;
};
