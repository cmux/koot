const transformFixDefaultExport = require('./transform-fix-default-export');

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
            ...loader
        }) {
            Object.assign(customOptions, {
                __createDll,
                __react,
                __typescript,
                __server
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
                __server = false
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
            // if (isServer) {
            //     newPresets.forEach((preset, index) => {
            //         if (
            //             typeof preset.file === 'object' &&
            //             /^@babel\/preset-env$/.test(preset.file.request)
            //         ) {
            //             const thisPreset = newPresets[index];
            //             if (typeof thisPreset.options !== 'object')
            //                 thisPreset.options = {};
            //             thisPreset.options.modules = false;
            //             thisPreset.options.exclude = [
            //                 '@babel/plugin-transform-regenerator',
            //                 '@babel/plugin-transform-async-to-generator'
            //             ];
            //             thisPreset.options.ignoreBrowserslistConfig = true;
            //             // console.log(thisPreset);
            //         }
            //     });
            // }

            // plugins ========================================================
            const newPlugins = plugins.filter(plugin => {
                if (
                    typeof plugin.file === 'object' &&
                    (/extract-hoc(\/|\\)babel/.test(plugin.file.request) ||
                        /react-hot-loader(\/|\\)babel/.test(
                            plugin.file.request
                        ))
                )
                    return false;

                // if (
                //     isServer &&
                //     typeof plugin.file === 'object' &&
                //     /@babel(\/|\\)plugin-transform-regenerator/.test(
                //         plugin.file.request
                //     )
                // )
                //     return false;

                return true;
            });

            if (
                !__createDll &&
                __react &&
                process.env.WEBPACK_BUILD_ENV === 'dev'
            ) {
                newPlugins.push(require('extract-hoc/babel'));
                newPlugins.push(require('react-hot-loader/babel'));
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
