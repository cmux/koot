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

    const useBabelLoader = (options = {}) => {
        if (typeof options.cacheDirectory === 'undefined')
            options.cacheDirectory = true
        if (process.env.WEBPACK_BUILD_ENV === 'dev') {
            options.compact = false
            if (createDll)
                options.__createDll = true
        }
        return {
            loader: require.resolve('../../../loaders/babel'),
            options
        }
    }

    if (!createDll && env === 'dev' && stage === 'client') {
        return [{
            test: /\.(js|mjs)$/,
            use: useBabelLoader()
        }, {
            test: /\.jsx$/,
            use: [
                useBabelLoader({
                    __react: true
                }),
                require.resolve('../../../loaders/react-hot')
            ]
        }]
    }

    if (!createDll && env === 'dev' && stage === 'server') {
        return [{
            test: /\.(js|mjs|jsx)$/,
            use: [
                useBabelLoader(),
                require.resolve('../../../loaders/koot-dev-ssr.js')
            ]
        }]
    }

    return [{
        test: /\.(js|mjs|jsx)$/,
        use: useBabelLoader()
    }]
}
