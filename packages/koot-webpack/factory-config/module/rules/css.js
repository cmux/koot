const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const {
    moduleCssFilenameTest: defaultModuleCssFilenameTest,
    classNameHashLength: defaultClassNameHashLength,
} = require('koot/defaults/koot-config');

/**
 * Loader 规则 - CSS
 * @param {Object} kootBuildConfig
 * @returns {Array} rules
 */
module.exports = (kootBuildConfig = {}) => {
    const env = process.env.WEBPACK_BUILD_ENV;
    const stage = process.env.WEBPACK_BUILD_STAGE;
    const regExpKootModules = /koot-component/;

    const {
        // aliases = {},
        moduleCssFilenameTest = defaultModuleCssFilenameTest,
        internalLoaderOptions = {},
        classNameHashLength = defaultClassNameHashLength,
        distClientAssetsDirName,
    } = kootBuildConfig;

    /** @type {Array} rules */
    const rules = [];

    /** @type {Boolean} 是否允许抽取 CSS */
    const extractCssAllowed =
        env === 'prod' || (env === 'dev' && stage === 'client') ? true : false;

    // 各 Loader 的规则
    const {
        'less-loader': lessLoaderConfig = {},
        'sass-loader': sassLoaderConfig = {},
    } = internalLoaderOptions;
    // Koot 相关 PostCSS 插件的配置
    const kootPostCSSOptions = {
        length: classNameHashLength,
        mode: 'replace',
        readable: env === 'dev' ? true : false,
        prefixToRemove:
            process.env.WEBPACK_BUILD_TYPE === 'spa' && distClientAssetsDirName
                ? `${distClientAssetsDirName}/`
                : undefined,
    };
    const useSpCssLoader = {
        loader: require.resolve('../../../loaders/css'),
        options: kootPostCSSOptions,
    };
    // const useUniversalAliasLoader = {
    //     loader: 'universal-alias-loader',
    //     options: {
    //         alias: aliases,
    //     },
    // };
    const useLessLoader = (() => {
        const options = {
            lessOptions: {
                javascriptEnabled: true,
            },
            ...lessLoaderConfig,
        };

        // 兼容处理: less-loader v6 - less 配置移动到 lessOptions 中
        // https://github.com/webpack-contrib/less-loader/issues/350
        const {
            lessOptions,
            prependData = '',
            appendData = '',
            additionaldata,
            sourceMap,
            // implementation = {},
            ...rest
        } = options;
        for (const [key, value] of Object.entries(rest))
            lessOptions[key] = value;

        return {
            loader: 'less-loader',
            options: {
                lessOptions,
                additionalData: additionaldata || `${prependData}${appendData}`,
                sourceMap,
                // implementation,
            },
        };
    })();
    const useSassLoader = {
        loader: 'sass-loader',
        options: {
            ...sassLoaderConfig,
        },
    };
    const useLastLoaderForNormal = (() => {
        if (stage !== 'client') return '';
        if (extractCssAllowed) return MiniCssExtractPlugin.loader;
        return 'style-loader';
    })();

    const rulesCSS = [];
    const rulesLESS = [];
    const rulesSASS = [];

    const validateCssRule = ({ test, tests, type, ...rule }) => {
        let use = [
            {
                loader: 'postcss-loader',
                postcssOptions: kootPostCSSOptions,
            },
            // >> LESS / SASS loader inset here <<
            // useUniversalAliasLoader,
        ];
        // const loaderOffset = -1
        const loaderOffset = 0;

        switch (type) {
            case 'component': {
                use.unshift(useSpCssLoader);
                break;
            }
            default: {
                use.unshift('css-loader');
                use.unshift(useLastLoaderForNormal);
                // use.unshift("style-loader")
            }
        }

        use = use.filter((item) => !!item);

        if (typeof tests === 'object') {
            Object.keys(tests).forEach((key) => {
                const useThis = [...use];
                if (key === 'less') {
                    useThis.splice(
                        useThis.length + loaderOffset,
                        0,
                        useLessLoader
                    );
                    rulesLESS.push({
                        test: tests[key],
                        use: useThis,
                        ...rule,
                    });
                } else if (key === 'sass') {
                    useThis.splice(
                        useThis.length + loaderOffset,
                        0,
                        useSassLoader
                    );
                    rulesSASS.push({
                        test: tests[key],
                        use: useThis,
                        ...rule,
                    });
                } else {
                    rulesCSS.push({
                        test: tests[key],
                        use: useThis,
                        ...rule,
                    });
                }
            });
        } else if (test instanceof RegExp) {
            const str = test.toString();
            if (/\.less/.test(str)) {
                use.splice(use.length + loaderOffset, 0, useLessLoader);
                rulesLESS.push({
                    test: test,
                    use,
                    ...rule,
                });
            } else if (/\.(scss|sass)/.test(str)) {
                use.splice(use.length + loaderOffset, 0, useSassLoader);
                rulesSASS.push({
                    test: test,
                    use,
                    ...rule,
                });
            } else {
                rulesCSS.push({
                    test: test,
                    use,
                    ...rule,
                });
            }
        } else if (test) {
            if (/\.less$/.test(test)) {
                use.splice(use.length + loaderOffset, 0, useLessLoader);
                rulesLESS.push({
                    test: test,
                    use,
                    ...rule,
                });
            } else if (/\.(scss|sass)$/.test(test)) {
                use.splice(use.length + loaderOffset, 0, useSassLoader);
                rulesSASS.push({
                    test: test,
                    use,
                    ...rule,
                });
            } else {
                rulesCSS.push({
                    test: test,
                    use,
                    ...rule,
                });
            }
        } else {
            {
                const useThis = [...use];
                useThis.splice(useThis.length + loaderOffset, 0, useLessLoader);
                rulesLESS.push({ use: useThis, ...rule });
            }
            {
                const useThis = [...use];
                useThis.splice(useThis.length + loaderOffset, 0, useSassLoader);
                rulesSASS.push({ use: useThis, ...rule });
            }
            rulesCSS.push({ use, ...rule });
        }
    };

    // node_modules/koot-component
    validateCssRule({
        tests: {
            css: /\.(component|module)\.css$/,
            less: /\.(component|module)\.less$/,
            sass: /\.(component|module)\.(scss|sass)$/,
        },
        include: regExpKootModules,
        type: 'component',
    });

    // 处理组件 CSS 规则
    (Array.isArray(moduleCssFilenameTest)
        ? moduleCssFilenameTest
        : [moduleCssFilenameTest]
    )
        .map((test) => {
            if (typeof test === 'object' && !(test instanceof RegExp)) {
                let { exclude } = test;
                if (!Array.isArray(exclude))
                    exclude = typeof exclude === 'undefined' ? [] : [exclude];
                exclude.push(regExpKootModules);
                test.exclude = exclude;
                if (typeof test.test !== 'undefined') {
                    const testComponent = validateCssFilenameTest(
                        test.test,
                        'component'
                    );
                    delete test.test;
                    return {
                        ...test,
                        tests: {
                            css: testComponent.css,
                            less: testComponent.less,
                            sass: testComponent.sass,
                        },
                        type: 'component',
                    };
                }
                return {
                    ...test,
                    type: 'component',
                };
            }
            const testComponent = validateCssFilenameTest(test, 'component');
            return {
                tests: {
                    css: testComponent.css,
                    less: testComponent.less,
                    sass: testComponent.sass,
                },
                exclude: [
                    /*testNormal.css, */ /node_modules/,
                    regExpKootModules,
                ],
                type: 'component',
            };
        })
        .forEach(validateCssRule);

    // CSS: normal
    validateCssRule({
        // tests: {
        //     css: testNormal.css,
        //     less: testNormal.less,
        //     sass: testNormal.sass,
        // },
        exclude: [/node_modules/, regExpKootModules],
        type: 'normal',
    });

    //

    const useLastNormalLoaders = [
        useLastLoaderForNormal,
        'css-loader',
        'postcss-loader',
    ].filter((item) => !!item);
    rules.push({
        test: /\.css$/,
        oneOf: [
            ...rulesCSS,
            {
                include: /node_modules/,
                exclude: regExpKootModules,
                use: [...useLastNormalLoaders],
            },
        ],
    });
    rules.push({
        test: /\.less$/,
        oneOf: [
            ...rulesLESS,
            {
                include: /node_modules/,
                exclude: regExpKootModules,
                use: [...useLastNormalLoaders, useLessLoader],
            },
        ],
    });
    rules.push({
        test: /\.(scss|sass)$/,
        oneOf: [
            ...rulesSASS,
            {
                include: /node_modules/,
                exclude: regExpKootModules,
                use: [...useLastNormalLoaders, useSassLoader],
            },
        ],
    });

    return rules;
};

const validateCssFilenameTest = (test, basename = '') => {
    if (test instanceof RegExp) {
        let regStr = test.toString();
        regStr = regStr.substr(1, regStr.length - 2);

        // console.log(regStr)

        return {
            css: new RegExp(`${regStr}\\.css$`),
            less: new RegExp(`${regStr}\\.less$`),
            sass: new RegExp(`${regStr}\\.(sass|scss)$`),
            // less: new RegExp(regStr.replace(/\.css\$$/, '.less$')),
            // sass: new RegExp(regStr.replace(/\.css\$$/, '.(sass|scss)$')),
        };
    }

    if (typeof test === 'string') {
        return {
            css: test,
            less: test.replace(/\.css/g, '.less'),
            sass: test.replace(/\.css/g, '.sass'),
            // scss: test.replace(/\.css/g, '.scss'),
        };
    }

    return {
        css: new RegExp(`${basename}\\.css$`),
        less: new RegExp(`${basename}\\.less$`),
        sass: new RegExp(`${basename}\\.(sass|scss)$`),
    };
};
