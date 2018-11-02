const MiniCssExtractPlugin = require("mini-css-extract-plugin")

/**
 * 生成配置片段 - module.rules
 * @returns {Array}
 */
module.exports = (options = {}) => {
    const env = process.env.WEBPACK_BUILD_ENV
    const stage = process.env.WEBPACK_BUILD_STAGE

    const {
        aliases = {},
        // defines = {},
        css = {},
    } = options

    const rules = [
        // CSS - in node_modules
        {
            test: /\.css$/,
            include: /node_modules/,
            use: [
                "style-loader",
                "postcss-loader"
            ]
        }, {
            test: /\.less$/,
            include: /node_modules/,
            use: [
                "style-loader",
                "postcss-loader",
                "less-loader"
            ]
        }, {
            test: /\.(scss|sass)$/,
            include: /node_modules/,
            use: [
                "style-loader",
                "postcss-loader",
                "sass-loader"
            ]
        },
    ]

    // 处理 JS 规则
    {
        let rulesJS = {
            test: /\.(js|jsx)$/,
            use: [
                {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true
                    }
                }
            ]
        }
        rules.push(rulesJS)
        if (env === 'dev' && stage === 'client') {
            rules.push({
                test: /\.jsx$/,
                use: [
                    require.resolve('../../loaders/react-hot'),
                ]
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
            normal: cssTestNormal = /^((?!\.component\.).)*$/,
            component: cssTestComponent = /\.component$/,
        } = cssTest

        /** @type {Boolean} 是否允许抽取 CSS */
        const extractCSS = (
            env === 'prod' ||
            (env === 'dev' && stage === 'client')
        ) ? true : false

        const useSpCssLoader = `sp-css-loader?length=4&mode=replace&readable=${env === 'dev' ? 'true' : 'false'}`
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

        // CSS: component
        rules.push({
            test: testComponent.css,
            exclude: [/*testNormal.css, *//node_modules/],
            use: [
                useSpCssLoader,
                "postcss-loader",
                useUniversalAliasLoader
            ]
        })
        rules.push({
            test: testComponent.less,
            exclude: [/*testNormal.less, *//node_modules/],
            use: [
                useSpCssLoader,
                "postcss-loader",
                useLessLoader,
                useUniversalAliasLoader
            ]
        })
        rules.push({
            test: testComponent.sass,
            exclude: [/*testNormal.sass, *//node_modules/],
            use: [
                useSpCssLoader,
                "postcss-loader",
                useSassLoader,
                useUniversalAliasLoader
            ]
        })

        // CSS: extract
        if (extractCSS) {
            const arr = (!Array.isArray(cssExtract)) ? [cssExtract] : cssExtract
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

        // CSS: normal
        rules.push({
            test: testNormal.css,
            exclude: extractCSS ? cssExtract : [],
            // loader: 'style-loader!postcss-loader'
            use: [
                "style-loader",
                "css-loader",
                "postcss-loader",
                useUniversalAliasLoader
            ]
        })
        rules.push({
            test: testNormal.less,
            exclude: extractCSS ? cssExtract : [],
            // loader: 'style-loader!postcss-loader'
            use: [
                "style-loader",
                "css-loader",
                "postcss-loader",
                useLessLoader,
                useUniversalAliasLoader
            ]
        })
        rules.push({
            test: testNormal.sass,
            exclude: extractCSS ? cssExtract : [],
            // loader: 'style-loader!postcss-loader'
            use: [
                "style-loader",
                "css-loader",
                "postcss-loader",
                useSassLoader,
                useUniversalAliasLoader
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
