const factoryConfig = require('./_factory');
const path = require('path');

module.exports = (async () => {
    const defaults = await factoryConfig();

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
                'js-cookie'
            ],
            ...defaults.entry
        },

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
                        chunks: 'initial',
                        minChunks: 2
                    }
                }
            }
        }
    };

    return Object.assign({}, defaults, config);
})();
