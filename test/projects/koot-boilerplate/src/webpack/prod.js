const factoryConfig = require('./.factory')

module.exports = (async () => {
    const defaults = await factoryConfig()

    // 针对生产环境的定制配置
    const config = {
        entry: {
            commons: [
                'react',
                'react-dom',

                'redux',
                'redux-thunk',
                'react-redux',

                'react-router',
                'react-router-redux',

                // 'react-transition-group',

                // 'localforage',
                // 'metas',
                // 'classnames',
                'js-cookie',
            ],
            ...defaults.entry,
        },

        output: {
            filename: `core.[chunkhash].js`,
            chunkFilename: `chunk.[chunkhash].js`,
        },

        optimization: {
            splitChunks: {
                cacheGroups: {
                    commons: {
                        name: "commons",
                        chunks: "initial",
                        minChunks: 2
                    }
                }
            }
        }
    }

    return Object.assign({}, defaults, config)
})()
