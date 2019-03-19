const path = require('path')


// ****************************************************************************


/** @type {Object} 基础配置 */
const configBase = {

    entry: {
        /**
         * 自定入口文件，需要手动编写使用逻辑
         * - 该模板项目中，本 `critical` 入口的结果会被自动写入到 HTML 结果内，位于 `<body>` 标签中所有自动插入的 `<script>` 标签之前
         * - 详见模板文件 `/src/index.ejs` 内的 `<%- content('critical.js') %>`
         */
        critical: [
            path.resolve(__dirname, '../src/critical.js')
        ],

        /**
         * Koot.js 会自动加入一个名为 `client` 的入口，其中包含所有 React 相关逻辑
         * - 模板中的 `<%- inject.scripts %>` 会被自动替换为 `client` 入口的相关内容
         */
    },

    module: {
        rules: [
            /** 
             * Koot.js 会为以下类型的文件自动添加 loader，无需进行配置
             * - `js` `mjs` `jsx`
             * - `css` `sass` `less`
             */
            {
                test: /\.(ico|gif|jpg|jpeg|png|webp)$/,
                loader: 'file-loader?context=static&name=assets/[hash:32].[ext]',
                exclude: /node_modules/
            },
            {
                test: /\.svg$/,
                loader: 'svg-url-loader',
                exclude: /node_modules/,
                options: {
                    noquotes: true,
                }
            }
        ]
    },

}


// ****************************************************************************


/**
 * 生成 Webpack 配置
 * @returns {Object} Webpack 配置
 */
const factoryConfig = async () => {

    // 针对：开发环境
    if (process.env.WEBPACK_BUILD_ENV === 'dev')
        return configBase

    // 针对：生产环境
    // `entry` 项仅针对：客户端
    return Object.assign({}, configBase, {
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
                'classnames',
                'axios'
            ],
            ...configBase.entry,
        }
    })
}

module.exports = factoryConfig
