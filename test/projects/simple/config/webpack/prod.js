const factoryConfig = require('./_factory');

module.exports = async () => {
    const defaults = await factoryConfig();

    // 针对生产环境的定制配置
    const config = {
        output: {
            // path: path.resolve(__dirname, '../../dist/public/aaa'),
            // publicPath: "/aaa/",
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
                        test: new RegExp(
                            `[\\\\/]node_modules[\\\\/](${[
                                'react',
                                'react-dom',
                                'react-redux',
                                'react-router',
                                'react-router-redux',
                                'redux',
                                'redux-thunk',

                                'classnames',
                                'js-cookie',
                                'lodash',
                                'regenerator-runtime'
                            ].join('|')})[\\\\/]`
                        )
                    }
                }
            }
        }
    };

    return Object.assign({}, defaults, config);
};
