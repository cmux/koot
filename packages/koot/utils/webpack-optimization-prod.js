import getModuleVersion from './get-module-version.js';
import { chunkNameClientRunFirst } from '../defaults/before-build.js';

const keyName = parseInt(getModuleVersion('webpack')) < 5 ? 'name' : 'idHint';

/**
 * 生成 Webpack `optimization` 配置，用于拆分代码
 * - 仅针对: Webpack 配置生成
 * @param {Object} [options={}] 追加配置
 * @param {string[]} [options.extraLibs] 追加库名到 libs 包中
 * @returns {Object} Webpack `optimization` 配置
 */
const webpackOptimizationProd = (options = {}) => {
    const { extraLibs = [] } = options;
    const cacheGroups = {
        libs: {
            [keyName]: 'libs',
            priority: 100,
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

                    ...extraLibs,
                ].join('|')})[\\\\/]`
            ),
        },
        libsAntd: {
            [keyName]: 'libs-ant-design-related',
            priority: 90,
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
                    'rc-field-form',
                    'rc-form',
                    'rc-menu',
                    'rc-motion',
                    'rc-notification',
                    'rc-pagination',
                    'rc-picker',
                    'rc-progress',
                    'rc-resize-observer',
                    'rc-select',
                    'rc-tabs',
                    'rc-textarea',
                    'rc-tooltip',
                    'rc-trigger',
                    'rc-upload',
                    'rc-util',
                ].join('|')})[\\\\/]`
            ),
        },
        libsOthers: {
            [keyName]: 'libs-others',
            priority: 10,
            minChunks: 2,
            reuseExistingChunk: true,
        },
    };

    // const isKootTest =
    //     global.kootTest ||
    //     (process.env.KOOT_TEST_MODE && JSON.parse(process.env.KOOT_TEST_MODE));
    // if (isKootTest) {
    //     delete cacheGroups.libsOthers
    // }

    return {
        minimize: true,

        // noEmitOnErrors: true, // Webpack 4
        emitOnErrors: true, // Webpack 5

        splitChunks: {
            // chunks: 'all',
            chunks(chunk) {
                // RunFirst 不应该参与 optimization 处理
                return chunk.name !== chunkNameClientRunFirst;
            },
            maxAsyncRequests: 8,
            maxInitialRequests: 6,

            cacheGroups,
        },
    };
};

export default webpackOptimizationProd;
