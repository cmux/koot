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
            loader: 'babel-loader',
            options: {
                cacheDirectory: true,
            }
        }
    ]

    // 开发模式
    if (env === 'dev') {
        // 不进行压缩
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
                require.resolve('../../../loaders/react-hot'),
            ]
        })
    } else {
        rules.push({
            test: /\.(js|jsx)$/,
            use: useJS
        })
    }

    return rules
}
