const path = require('path')
const src = path.resolve(__dirname, '../')

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
            path.resolve(src, './app/critical.js')
        ],

        // polyfill: [
        //     "babel-polyfill",
        //     path.resolve(pathSrc, './client/critical.extra-old-ie.js')
        // ],
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
            }
        ]
    },

    plugins: [
    ],

})
