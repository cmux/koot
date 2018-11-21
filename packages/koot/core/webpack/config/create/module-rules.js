const MiniCssExtractPlugin = require("mini-css-extract-plugin")

/**
 * 生成配置片段 - module.rules
 * @returns {Array}
 */
module.exports = (options = {}) => {
    const env = process.env.WEBPACK_BUILD_ENV
    const stage = process.env.WEBPACK_BUILD_STAGE
    const regExpKootModules = /koot-component/

    const {
        aliases = {},
        // defines = {},
        css = {},
        createDll = false,
    } = options

    const rules = []

    // 处理 JS 规则
    {
        const useJS = [
            {
                loader: 'babel-loader',
                options: {
                    cacheDirectory: true,
                }
            }
        ]
        if (env === 'dev') {
            useJS[0].options.compact = false
        }
        if (!createDll && env === 'dev' && stage === 'client') {
            rules.push({
                test: /\.js$/,
                use: useJS
            })
            rules.push({
                test: /\.jsx$/,
                use: [
                    ...useJS,
                    require.resolve('koot-webpack/loaders/react-hot'),
                ]
            })
        } else {
            rules.push({
                test: /\.(js|jsx)$/,
                use: useJS
            })
        }
    }

    // 处理 CSS 规则
    {
        const {
            fileBasename: cssTest = {},
            extract: cssExtract = [/critical\.css$/, /critical\.less$/, /critical\.sass$/]
        } = css
        const {
            normal: cssTestNormal = /^((?!\.(component|module)\.).)*/,
            component: cssTestComponent = /\.(component|module)/,
        } = cssTest

        /** @type {Boolean} 是否允许抽取 CSS */
        const extractCSS = (
            env === 'prod' ||
            (env === 'dev' && stage === 'client')
        ) ? true : false

        const useSpCssLoader = {
            loader: require.resolve('../../loaders/css'),
            options: {
                length: 4,
                mode: 'replace',
                readable: env === 'dev' ? true : false
            }
        }
        const useUniversalAliasLoader = {
            loader: "universal-alias-loader",
            options: {
                alias: aliases
            }
        }
        const useLessLoader = {
            loader: "less-loader",
            options: {
                javascriptEnabled: true
            }
        }
        const useSassLoader = "sass-loader"

        const testNormal = validateCssFilenameTest(cssTestNormal)
        const testComponent = validateCssFilenameTest(cssTestComponent, 'component')

        const rulesCSS = []
        const rulesLESS = []
        const rulesSASS = []

        const validateCssRule = ({
            test, tests, type, ...rule
        }) => {
            const use = [useUniversalAliasLoader]

            switch (type) {
                case 'koot': {
                    use.unshift("postcss-loader")
                    use.unshift(useSpCssLoader)
                    break
                }
                default: {
                    use.unshift("postcss-loader")
                    use.unshift("css-loader")
                    use.unshift("style-loader")
                }
            }

            if (typeof tests === 'object') {
                Object.keys(tests).forEach(key => {
                    const useThis = [...use]
                    if (key === 'less') {
                        useThis.splice(useThis.length - 1, 0, useLessLoader)
                        rulesLESS.push({
                            test: tests[key],
                            use: useThis,
                            ...rule
                        })
                    } else if (key === 'sass') {
                        useThis.splice(useThis.length - 1, 0, useSassLoader)
                        rulesSASS.push({
                            test: tests[key],
                            use: useThis,
                            ...rule
                        })
                    } else {
                        rulesCSS.push({
                            test: tests[key],
                            use: useThis,
                            ...rule
                        })
                    }
                })
            } else if (test instanceof RegExp) {
                const str = test.toString()
                if (/\.less/.test(str)) {
                    use.splice(use.length - 1, 0, useLessLoader)
                    rulesLESS.push({
                        test: test,
                        use,
                        ...rule
                    })
                } else if (/\.(scss|sass)/.test(str)) {
                    use.splice(use.length - 1, 0, useSassLoader)
                    rulesSASS.push({
                        test: test,
                        use,
                        ...rule
                    })
                } else {
                    rulesCSS.push({
                        test: test,
                        use,
                        ...rule
                    })
                }
            } else {
                if (/\.less$/.test(test)) {
                    use.splice(use.length - 1, 0, useLessLoader)
                    rulesLESS.push({
                        test: test,
                        use,
                        ...rule
                    })
                } else if (/\.(scss|sass)$/.test(test)) {
                    use.splice(use.length - 1, 0, useSassLoader)
                    rulesSASS.push({
                        test: test,
                        use,
                        ...rule
                    })
                } else {
                    rulesCSS.push({
                        test: test,
                        use,
                        ...rule
                    })
                }
            }
        }

        // extract
        if (extractCSS) {
            const arr = (!Array.isArray(cssExtract)) ? [cssExtract] : [...cssExtract]
            arr.forEach(test => {
                const use = [
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                    "postcss-loader",
                ]
                if (test instanceof RegExp) {
                    const str = test.toString()
                    if (/\.less/.test(str))
                        use.push(useLessLoader)
                    if (/\.(scss|sass)/.test(str))
                        use.push(useSassLoader)
                } else {
                    if (/\.less$/.test(test))
                        use.push(useLessLoader)
                    if (/\.(scss|sass)$/.test(test))
                        use.push(useSassLoader)
                }
                use.push(useUniversalAliasLoader)
                rules.push({ test, use })
            })
        }

        // node_modules/koot-component
        validateCssRule({
            tests: {
                css: /\.(component|module)\.css$/,
                less: /\.(component|module)\.less$/,
                sass: /\.(component|module)\.(scss|sass)$/,
            },
            include: regExpKootModules,
            type: 'koot'
        })

        // CSS: component
        validateCssRule({
            tests: {
                css: testComponent.css,
                less: testComponent.less,
                sass: testComponent.sass,
            },
            exclude: [/*testNormal.css, *//node_modules/, regExpKootModules],
            type: 'koot'
        })

        // CSS: normal
        const excludeNormal = Array.isArray(cssExtract) ? [...cssExtract] : []
        excludeNormal.push(regExpKootModules)
        validateCssRule({
            tests: {
                css: testNormal.css,
                less: testNormal.less,
                sass: testNormal.sass,
            },
            exclude: excludeNormal,
            type: 'normal'
        })

        // 

        rules.push({
            test: /\.css$/,
            oneOf: [
                ...rulesCSS,
                {
                    include: /node_modules/,
                    exclude: regExpKootModules,
                    use: [
                        "style-loader",
                        "postcss-loader"
                    ]
                },
            ]
        })
        rules.push({
            test: /\.less$/,
            oneOf: [
                ...rulesLESS,
                {
                    include: /node_modules/,
                    exclude: regExpKootModules,
                    use: [
                        "style-loader",
                        "postcss-loader",
                        "less-loader"
                    ]
                },
            ]
        })
        rules.push({
            test: /\.(scss|sass)$/,
            oneOf: [
                ...rulesSASS,
                {
                    include: /node_modules/,
                    exclude: regExpKootModules,
                    use: [
                        "style-loader",
                        "postcss-loader",
                        "sass-loader"
                    ]
                },
            ]
        })
    }

    return rules
}

const validateCssFilenameTest = (test, basename = '') => {
    if (test instanceof RegExp) {
        let regStr = test.toString()
        regStr = regStr.substr(1, regStr.length - 2)

        // console.log(regStr)

        return {
            css: new RegExp(`${regStr}\\.css$`),
            less: new RegExp(`${regStr}\\.less$`),
            sass: new RegExp(`${regStr}\\.(sass|scss)$`),
            // less: new RegExp(regStr.replace(/\.css\$$/, '.less$')),
            // sass: new RegExp(regStr.replace(/\.css\$$/, '.(sass|scss)$')),
        }
    }

    if (typeof test === 'string') {
        return {
            css: test,
            less: test.replace(/\.css/g, '.less'),
            sass: test.replace(/\.css/g, '.sass'),
            // scss: test.replace(/\.css/g, '.scss'),
        }
    }

    return {
        css: new RegExp(`${basename}\\.css$`),
        less: new RegExp(`${basename}\\.less$`),
        sass: new RegExp(`${basename}\\.(sass|scss)$`),
    }
}
