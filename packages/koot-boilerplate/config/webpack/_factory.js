const webpack = require('webpack');
const path = require('path')
const src = path.resolve(__dirname, '../../src')

module.exports = async () => ({

    entry: {
        /**
         * !! 特殊入口 !!
         * 
         * 保证本入口内的代码为浏览器渲染页面前必须执行的代码
         * 
         * `critical.g.css``critical.g.sass``critical.g.less` 默认会被打包成独立文件
         * 默认的注入 (inject) 方法对 critical 有特殊的处理：
         *      - CSS结果会直接写入HTML `head`标签中
         *      - JavaScript结果会直接写入HTML `body`标签的结尾，其他注入结果之前
         */
        critical: [
            path.resolve(src, './critical.js')
        ],
    },

    module: {
        rules: [
            {
                test: /\.(ico|gif|jpg|jpeg|png|webp)$/,
                loader: 'file-loader?context=static&name=assets/[hash:32].[ext]',
                exclude: /node_modules/
            }, {
                test: /\.svg$/,
                loader: 'svg-url-loader',
                exclude: /node_modules/,
                options: {
                    noquotes: true,
                }
            },
            {
                test: path.resolve(src, 'store'),
                use: [
                    {
                        loader: 'expose-loader',
                        options: 'Store'
                    }
                ]
            }
        ]
    },

    plugins: [
        undefined, // Koot.js: 处理 webpack 配置时会自动过滤掉 null、undefined 等无意义的项
        new webpack.ProvidePlugin({
            KootExtend: ['koot', 'extend'],
            ActionTypes: ['@constants/action-types.js', 'default'],
            ReducerTypes: ['@constants/reducer-types.js', 'default'],
            Api: ['@constants/api.js', 'default'],
            Project: ['@constants/project.js', 'default'],
            __: ['@locales/__.js', 'default'],
            // Store: ['@store/index.js', 'default']
            //...
        }),
    ],

})
