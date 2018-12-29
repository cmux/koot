const factoryConfig = require('./_factory')

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
                'js-cookie',
            ],
            ...defaults.entry,
        },

        // optimization: {
        //     splitChunks: {
        //         cacheGroups: {
        //             commons: {
        //                 name: "commons",
        //                 chunks: "initial",
        //                 minChunks: 2
        //             }
        //         }
        //     }
        // }
    }

    return Object.assign({}, defaults, config)
})()
