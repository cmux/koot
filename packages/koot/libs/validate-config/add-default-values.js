const fs = require('fs-extra');
const path = require('path');
const semver = require('semver');
const merge = require('lodash/merge');

const defaultValues = require('../../defaults/koot-config');
const {
    keyKootBaseVersion,
    // typesSPA
} = require('../../defaults/before-build');

/**
 * 为空项添加默认值
 * @async
 * @param {String} projectDir
 * @param {Object} config
 * @returns {Object}
 */
module.exports = async (projectDir, config) => {
    const filePackageJson = path.resolve(projectDir, 'package.json');
    const kootBaseVersion = await (async () => {
        if (!fs.existsSync(filePackageJson)) return;
        const { koot = {} } = await fs.readJson(filePackageJson);
        return koot.baseVersion || undefined;
    })();

    Object.keys(defaultValues).forEach((key) => {
        if (typeof config[key] === 'undefined') {
            if (
                key === 'bundleVersionsKeep' &&
                kootBaseVersion &&
                semver.lt(kootBaseVersion, '0.9.0')
            ) {
                config[key] = false;
            } else {
                config[key] = defaultValues[key];
            }
        } else if (
            typeof config[key] === typeof defaultValues[key] &&
            typeof config[key] === 'object' &&
            !(config[key] instanceof RegExp) &&
            !(defaultValues[key] instanceof RegExp) &&
            !Array.isArray(config[key]) &&
            !Array.isArray(defaultValues[key])
        ) {
            config[key] = merge({}, config[key], defaultValues[key]);
        }
    });

    if (!config[keyKootBaseVersion]) {
        config[keyKootBaseVersion] =
            kootBaseVersion ||
            semver.valid(semver.coerce(process.env.KOOT_VERSION));
    }

    if (!config.name) {
        if (fs.existsSync(filePackageJson)) {
            config.name = require(filePackageJson).name;
        }
    }

    if (!config.webpackConfig) {
        config.webpackConfig = () => {
            if (process.env.WEBPACK_BUILD_ENV === 'dev') return {};
            return {
                entry: {
                    commons: [
                        'react',
                        'react-dom',
                        'redux',
                        'redux-thunk',
                        'react-redux',
                        'react-router',
                        'react-router-redux',
                    ],
                },
                optimization: {
                    splitChunks: {
                        cacheGroups: {
                            commons: {
                                idHint: 'commons',
                                chunks: 'initial',
                                minChunks: 2,
                            },
                        },
                    },
                },
            };
        };
    }

    if (
        process.env.WEBPACK_BUILD_ENV === 'dev'
        // process.env.WEBPACK_BUILD_TYPE === 'spa' ||
        // typesSPA.includes(config.type)
    ) {
        config.bundleVersionsKeep = false;
    }
};
