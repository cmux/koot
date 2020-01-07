/**
 * 生成 Webpack `optimization` 配置，用于拆分代码
 * - 仅针对: Webpack 配置生成
 * @param {Object} [options={}] 追加配置
 * @param {string[]} [options.extraLibs] 追加库名到 libs 包中
 * @returns {Object} Webpack `optimization` 配置
 */
module.exports = (options = {}) => {
    const { extraLibs = [] } = options;
    const cacheGroups = {
        libs: {
            name: 'libs',
            priority: 100,
            chunks: 'all',
            minChunks: 1,
            reuseExistingChunk: true,
            test: new RegExp(
                `[\\\\/]node_modules[\\\\/](${[
                    // react
                    'react',
                    'react-dom',
                    'react-redux',
                    'react-router',
                    'react-router-redux',
                    'redux',
                    'redux-thunk',

                    // babel, webpack & other tools
                    // 'regenerator-runtime',

                    // common libraries
                    // 'axios',
                    // 'classnames',
                    // 'history',
                    // 'js-cookie',
                    // 'lodash',
                    // 'underscore'

                    ...extraLibs
                ].join('|')})[\\\\/]`
            )
        },
        libsAntd: {
            name: 'libs-ant-design-related',
            priority: 90,
            chunks: 'all',
            minChunks: 1,
            reuseExistingChunk: true,
            test: new RegExp(
                `[\\\\/]node_modules[\\\\/](${[
                    '@ant-design',
                    'antd',
                    'moment',
                    'rc-align',
                    'rc-animate',
                    'rc-calendar',
                    'rc-checkbox',
                    'rc-form',
                    'rc-menu',
                    'rc-notification',
                    'rc-pagination',
                    'rc-progress',
                    'rc-resize-observer',
                    'rc-select',
                    'rc-tabs',
                    'rc-tooltip',
                    'rc-trigger',
                    'rc-upload',
                    'rc-util'
                ].join('|')})[\\\\/]`
            )
        },
        libsOthers: {
            name: 'libs-others',
            priority: 10,
            chunks: 'all',
            minChunks: 2,
            reuseExistingChunk: true
        }
    };

    // const isKootTest =
    //     global.kootTest ||
    //     (process.env.KOOT_TEST_MODE && JSON.parse(process.env.KOOT_TEST_MODE));
    // if (isKootTest) {
    //     delete cacheGroups.libsOthers
    // }

    return {
        minimize: true,
        noEmitOnErrors: true,

        splitChunks: {
            maxAsyncRequests: 8,
            maxInitialRequests: 6,

            cacheGroups
        }
    };
};
