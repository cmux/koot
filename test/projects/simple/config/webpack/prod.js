const factoryConfig = require('./_factory');

module.exports = async () => {
    const defaults = await factoryConfig();

    // 针对生产环境的定制配置
    const config = {
        output: {
            filename: `core.[chunkhash].js`,
            chunkFilename: `chunk.[chunkhash].js`
        },

        optimization: {
            splitChunks: {
                cacheGroups: {
                    commons: {
                        name: 'commons',
                        chunks: 'all',
                        minChunks: 1,
                        reuseExistingChunk: true,
                        test: module =>
                            [
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
                                'js-cookie'
                            ].includes(module.name)
                    }
                }
            }
        }
    };

    return Object.assign({}, defaults, config);
};
