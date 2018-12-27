/**
 * Loader 规则 - Javascript
 * @param {Object} options
 * @returns {Array} rules
 */
module.exports = (kootBuildConfig = {}) => {
    const env = process.env.WEBPACK_BUILD_ENV
    const stage = process.env.WEBPACK_BUILD_STAGE

    const {
        createDll = false,
    } = kootBuildConfig

    /** @type {Array} rules */
    const rules = []

    /** @type {Array} JS 基础规则 */
    const useJS = [
        {
            loader: require.resolve('../../../loaders/babel'),
            options: {
                cacheDirectory: true,
            }
        }
    ]

    // 开发模式
    if (env === 'dev') {
        // 不进行压缩
        useJS[0].options.compact = false
        // if (stage === 'server') {
        //     useJS[0].options.presets = [
        //         // ["@babel/preset-env", {
        //         //     "targets": {
        //         //         "node": "current"
        //         //     }
        //         // }],
        //         "@babel/preset-react",
        //         "@babel/preset-flow"
        //     ]
        //     useJS[0].options.plugins = [
        //         "@babel/plugin-transform-regenerator",
        //         ["@babel/plugin-proposal-decorators", { "legacy": true }],
        //         "@babel/plugin-proposal-class-properties",
        //         "@babel/plugin-syntax-dynamic-import",
        //     ]
        // }
    }

    if (!createDll && env === 'dev' && stage === 'client') {
        rules.push({
            test: /\.(js|mjs)$/,
            use: useJS
        })
        rules.push({
            test: /\.jsx$/,
            use: [
                ...useJS,
                // require.resolve('../../../loaders/react-hot'),
            ]
        })
    } else {
        rules.push({
            test: /\.(js|mjs|jsx)$/,
            use: useJS
        })
    }

    return rules
}
