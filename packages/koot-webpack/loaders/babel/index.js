const fs = require('fs-extra');
const path = require('path');
const { createConfigItem } = require('@babel/core/lib/config/item');
const semver = require('semver');

// const { KOOT_REACT_RUNTIME } = require('koot/defaults/envs');
const getCwd = require('koot/utils/get-cwd');
// const transformFixDefaultExport = require('./transform-fix-default-export');

const { version: reactVersion } = require('react/package.json');

const getKootFile = require('../../libs/get-koot-file');

// ============================================================================

/**
 * 修改 Preset 对象的选项
 * - 因为 Babel 不允许直接修改 Preset 的值，实际为根据传入的 Preset 生成一个全新的对象并返回
 * @param {ConfigItem} preset
 * @param {Object} appendOptions
 * @param {Object} defaultOptions
 */
const modifyPresetOptions = (preset, appendOptions = {}, defaultOptions = {}) =>
    createConfigItem(
        [
            preset.file.request,
            {
                ...defaultOptions,
                ...(preset.options || {}),
                ...appendOptions,
            },
        ],
        {
            dirname: preset.dirname,
            type: 'preset',
        }
    );

/**
 * 检查 Plugin 对象的请求文件的名字
 * @param {Object} plugin Babel 处理过程中的 Plugin 对象
 * @param {string|regExp} name
 * @return {boolean}
 */
const testPluginName = (pluginObject, regExp) => {
    regExp =
        regExp instanceof RegExp
            ? regExp
            : new RegExp(
                  `^@babel(\\/|\\\\)${
                      /^plugin-/.test(regExp) ? regExp : `plugin-${regExp}`
                  }$`
              );

    return (
        typeof pluginObject.file === 'object' &&
        regExp.test(pluginObject.file.request)
    );
};

/** 检查是否存在某个特定的 preset */
const hasPreset = (presets, regex) =>
    presets.some((preset) => regex.test(preset.file.request));

// const reactHotLoaderClientBlacklist = [
//     'koot/React/component-extender.jsx',
//     'koot/ReactApp/client/index.jsx',
//     'koot/ReactApp/server/ssr.jsx',
//     'koot/ReactSPA/client/run.jsx',
// ];

// ============================================================================

/** _Koot.js_ 所在路径 */
const kootPathname = path.dirname(getKootFile('package.json'));

// ============================================================================

module.exports = require('babel-loader').custom((babel) => {
    // function myPlugin() {
    //     return {
    //         visitor: {},
    //     };
    // }
    const customOptions = {};

    return {
        // Passed the loader options.
        customOptions({
            __createDll,
            __react,
            __typescript,
            __server,
            __routes,
            __spaTemplateInject,
            __i18n,
            ...loader
        }) {
            Object.assign(customOptions, {
                __createDll,
                __react,
                __typescript,
                __server,
                __routes,
                __spaTemplateInject,
                __i18n,
            });
            // Pull out any custom options that the loader might have.
            return {
                // Pass the options back with the two custom options removed.
                loader,
            };
        },

        // Passed Babel's 'PartialConfig' object.
        config(cfg) {
            // if (cfg.hasFilesystemConfig()) {
            //     // Use the normal config
            //     return cfg.options;
            // }

            const {
                __createDll,
                // __typescript,
                // __react,
                __server = false,
                __spaTemplateInject = false,
                __routes,
                __i18n,
            } = customOptions;
            const { presets, plugins, env, ...options } = cfg.options;
            const { filename } = options;
            const isServer =
                __server || process.env.WEBPACK_BUILD_STAGE === 'server';
            const isKootModule = !/^\.\./.test(
                path.relative(kootPathname, filename)
            );
            let isReactClassic = false;
            // console.log({ options });

            // make sure some settings correct ================================
            const __react =
                customOptions.__react || /\.(jsx|tsx)$/.test(filename);
            const __typescript =
                customOptions.__typescript || /\.(ts|tsx)$/.test(filename);

            // presets ========================================================
            const newPresets = [...presets];
            if (__react && !hasPreset(newPresets, /@babel\/preset-react/)) {
                newPresets.unshift([
                    require('@babel/preset-react').default,
                    {
                        runtime: 'automatic',
                    },
                ]);
            }
            if (
                __typescript &&
                !hasPreset(newPresets, /@babel\/preset-typescript/)
            ) {
                newPresets.unshift([
                    require('@babel/preset-typescript').default,
                    __react
                        ? {
                              isTSX: true,
                              allExtensions: true,
                          }
                        : {},
                ]);
            }
            newPresets.forEach((preset, index) => {
                if (!typeof preset.file === 'object') return;
                try {
                    if (/^@babel\/preset-env$/.test(preset.file.request)) {
                        const options = {
                            modules: false,
                            exclude: [
                                ...((preset.options || {}).exclude || []),
                            ],
                        };
                        if (isServer || __spaTemplateInject) {
                            options.targets = {
                                node: true,
                            };
                            options.ignoreBrowserslistConfig = true;
                            options.exclude.push(
                                '@babel/plugin-transform-regenerator'
                            );
                            options.exclude.push(
                                '@babel/plugin-transform-async-to-generator'
                            );
                        }
                        newPresets[index] = modifyPresetOptions(
                            preset,
                            options
                        );
                    }

                    /**
                     * 对于 Koot 内部的 JSX/TSX 文件，根据 React 版本检查 @babel/preset-react 配置，做出相应修改
                     * - 如果 >= 18 && runtime === 'classic' -> SET KOOT_REACT_RUNTIME = 'classic'
                     * - 如果 ^17.0.0 && runtime !== 'automatic' -> SET KOOT_REACT_RUNTIME = 'classic'
                     */
                    if (
                        // __react &&
                        isKootModule &&
                        /\.(jsx|tsx)$/.test(filename) &&
                        /^@babel\/preset-react$/.test(preset.file.request)
                    ) {
                        //     newPresets[index] = modifyPresetOptions(preset, {
                        //         runtime: 'automatic',
                        // });
                        const reactRuntime = preset.options
                            ? preset.options.runtime
                            : undefined;
                        isReactClassic =
                            (semver.satisfies(reactVersion, '^17.0.0') &&
                                reactRuntime !== 'automatic') ||
                            (semver.satisfies(reactVersion, '>=18') &&
                                reactRuntime === 'classic');
                        // console.log({
                        //     filename,
                        //     reactRuntime,
                        //     reactVersion,
                        //     satisfied17: semver.satisfies(
                        //         reactVersion,
                        //         '^17.0.0'
                        //     ),
                        //     satisfied18: semver.satisfies(reactVersion, '>=18'),
                        //     isReactClassic,
                        // });
                        // console.log('\n\n ', {
                        //     filename,
                        //     kootPathname,
                        //     relativePath: path.relative(kootPathname, filename),
                        //     isKootModule: !/^\.\./.test(
                        //         path.relative(kootPathname, filename)
                        //     ),
                        // });
                        // if (semver.satisfies(reactVersion, '^17.0.0')) {
                        //     process.env.KOOT_REACT_RUNTIME =
                        //         reactRuntime === 'automatic'
                        //             ? 'automatic'
                        //             : 'classic';
                        // } else if (semver.satisfies(reactVersion, '>=18')) {
                        //     process.env.KOOT_REACT_RUNTIME =
                        //         reactRuntime !== 'classic'
                        //             ? 'automatic'
                        //             : 'classic';
                        // } else {
                        //     process.env.KOOT_REACT_RUNTIME = 'classic';
                        // }
                        // console.log(process.env.KOOT_REACT_RUNTIME);
                    }
                } catch (e) {
                    return;
                }
            });

            // plugins ========================================================
            // console.log('\n ');
            // console.log('before', plugins.map(plugin => plugin.file.request));

            const newPlugins = plugins.filter((plugin) => {
                // console.log(plugin.file.request);
                if (testPluginName(plugin, /^extract-hoc(\/|\\)babel$/))
                    return false;
                if (testPluginName(plugin, /^react-hot-loader(\/|\\)babel$/))
                    return false;
                if (testPluginName(plugin, /^react-refresh(\/|\\)babel$/))
                    return false;
                if (testPluginName(plugin, 'transform-regenerator'))
                    return false;

                return true;
            });

            // console.log('after', newPlugins.map(plugin => plugin.file.request));

            if (
                !__createDll &&
                __react &&
                !isKootModule &&
                process.env.WEBPACK_BUILD_ENV === 'dev' &&
                !isServer
            ) {
                newPlugins.push([
                    require.resolve('react-refresh/babel'),
                    {
                        skipEnvCheck: Boolean(
                            process.env.KOOT_TEST_MODE &&
                                JSON.parse(process.env.KOOT_TEST_MODE)
                        ),
                    },
                ]);
            }
            if (!__createDll && !isServer) {
                let pathname = path.resolve(getCwd(), __routes);
                if (fs.lstatSync(pathname).isDirectory()) pathname += '/index';
                if (!fs.existsSync(pathname)) {
                    const exts = ['.js', '.ts'];
                    exts.some((ext) => {
                        const newPathname = path.resolve(pathname + ext);
                        if (fs.existsSync(newPathname)) {
                            pathname = newPathname;
                            return true;
                        }
                        return false;
                    });
                }
                newPlugins.push([
                    path.resolve(
                        __dirname,
                        './plugins/client-sanitize-code-spliting-name.js'
                    ),
                    {
                        routesConfigFile: pathname,
                    },
                ]);
                // console.log(newPlugins);
            }
            if (
                !__createDll &&
                typeof __i18n === 'object' &&
                __i18n.functionName
            ) {
                newPlugins.push([
                    path.resolve(__dirname, './plugins/i18n.js'),
                    __i18n,
                ]);
            }
            if (isReactClassic) {
                // console.log({ filename, isReactClassic });
                newPlugins.push([
                    path.resolve(
                        __dirname,
                        './plugins/react-classic-import.js'
                    ),
                    __i18n,
                ]);
            }

            const newEnv = env || {};
            if (typeof newEnv?.development?.compact === 'undefined') {
                if (typeof newEnv?.development !== 'object')
                    newEnv.development = {};
                newEnv.development.compact = false;
            }

            const thisOptions = {
                ...options,
                env: newEnv,
                presets: newPresets,
                plugins: newPlugins,
            };
            // console.log(isServer);

            return thisOptions;
        },

        result(result) {
            // const {
            // __createDll,
            // __react,
            // __typescript = false,
            // __server = false,
            // __spaTemplateInject = false,
            // __routes,
            // __i18n,
            // } = customOptions;

            // if (
            //     !__createDll &&
            //     __react &&
            //     process.env.WEBPACK_BUILD_ENV === 'dev' &&
            //     process.env.WEBPACK_BUILD_STAGE === 'client'
            // ) {
            //     result.code = transformFixDefaultExport(result.code);
            // }

            // if (!customOptions.__createDll) {
            //     const { code, ...remainings } = result;
            //     console.log(remainings);
            // }

            return {
                ...result,
            };
        },
    };
});
