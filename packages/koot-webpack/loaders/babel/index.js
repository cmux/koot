const fs = require('fs-extra');
const path = require('path');
const getCwd = require('koot/utils/get-cwd');
const transformFixDefaultExport = require('./transform-fix-default-export');

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

module.exports = require('babel-loader').custom(babel => {
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
            ...loader
        }) {
            Object.assign(customOptions, {
                __createDll,
                __react,
                __typescript,
                __server,
                __routes
            });
            // Pull out any custom options that the loader might have.
            return {
                // Pass the options back with the two custom options removed.
                loader
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
                __react,
                __typescript = false,
                __server = false,
                __routes
            } = customOptions;
            const { presets, plugins, ...options } = cfg.options;
            const isServer =
                __server || process.env.WEBPACK_BUILD_STAGE === 'server';
            // console.log({ options });

            // presets ========================================================
            const newPresets = [...presets];
            if (__typescript) {
                newPresets.unshift([
                    require('@babel/preset-typescript').default,
                    __react
                        ? {
                              isTSX: true,
                              allExtensions: true
                          }
                        : {}
                ]);
                // console.log(newPresets);
            }
            newPresets.forEach((preset, index) => {
                if (
                    typeof preset.file === 'object' &&
                    /^@babel\/preset-env$/.test(preset.file.request)
                ) {
                    const thisPreset = newPresets[index];
                    if (typeof thisPreset.options !== 'object')
                        thisPreset.options = {};
                    thisPreset.options.modules = false;
                    thisPreset.options.exclude = [
                        '@babel/plugin-transform-regenerator',
                        '@babel/plugin-transform-async-to-generator'
                    ];
                    if (isServer) {
                        thisPreset.options.targets = {
                            node: true
                        };
                        thisPreset.options.ignoreBrowserslistConfig = true;
                    }
                    // console.log(thisPreset);
                }
            });

            // plugins ========================================================
            // console.log('\n ');
            // console.log('before', plugins.map(plugin => plugin.file.request));

            const newPlugins = plugins.filter(plugin => {
                // console.log(plugin.file.request);
                if (testPluginName(plugin, /^extract-hoc(\/|\\)babel$/))
                    return false;
                if (testPluginName(plugin, /^react-hot-loader(\/|\\)babel$/))
                    return false;
                if (testPluginName(plugin, 'transform-regenerator'))
                    return false;

                return true;
            });

            // console.log('after', newPlugins.map(plugin => plugin.file.request));

            if (
                !__createDll &&
                __react &&
                process.env.WEBPACK_BUILD_ENV === 'dev'
            ) {
                newPlugins.push(require('extract-hoc/babel'));
                newPlugins.push(require('react-hot-loader/babel'));
            }

            if (
                !__createDll &&
                !isServer &&
                process.env.WEBPACK_BUILD_ENV === 'dev'
            ) {
                let pathname = path.resolve(getCwd(), __routes);
                if (fs.lstatSync(pathname).isDirectory()) pathname += '/index';
                if (!fs.existsSync(pathname)) {
                    const exts = ['.js', '.ts'];
                    exts.some(ext => {
                        const newPathname = path.resolve(pathname + ext);
                        if (fs.existsSync(newPathname)) {
                            pathname = newPathname;
                            return true;
                        }
                        return false;
                    });
                }
                newPlugins.push([
                    path.resolve(__dirname, './plugins/client-dev.js'),
                    {
                        routesConfigFile: pathname
                    }
                ]);
                // console.log(newPlugins);
            }

            const thisOptions = {
                ...options,
                presets: newPresets,
                plugins: newPlugins
            };
            // console.log(isServer);

            return thisOptions;
        },

        result(result) {
            if (
                !customOptions.__createDll &&
                customOptions.__react &&
                process.env.WEBPACK_BUILD_ENV === 'dev' &&
                process.env.WEBPACK_BUILD_STAGE === 'client'
            ) {
                result.code = transformFixDefaultExport(result.code);
            }

            // if (!customOptions.__createDll) {
            //     const { code, ...remainings } = result;
            //     console.log(remainings);
            // }

            return {
                ...result
            };
        }
    };
});
