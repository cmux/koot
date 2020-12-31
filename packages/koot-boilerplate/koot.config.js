/**
 * @module kootConfig
 *
 * Koot.js 项目配置
 *
 * 配置文档请查阅: [https://koot.js.org/#/config]
 */

const fs = require('fs');
const path = require('path');

module.exports = {
    /**************************************************************************
     * 项目基本信息
     *************************************************************************/
    type: 'react',
    dist: './dist',
    template: './src/index.ejs',
    templateInject: './src/index.inject.js',
    i18n: [
        ['zh', './src/locales/zh.js'],
        ['en', './src/locales/en.js'],
    ],

    /**************************************************************************
     * 路由 & 客户端历史记录
     *************************************************************************/
    routes: './src/routes',

    /**************************************************************************
     * 数据存储 & Store
     *************************************************************************/
    store: './src/store',

    /**************************************************************************
     * 客户端设置 & 生命周期
     *************************************************************************/
    icon: './src/assets/app-icon.png',
    webApp: {
        themeColor: '#0092f5',
    },

    /**************************************************************************
     * 服务器端设置 & 生命周期
     *************************************************************************/
    port: 8081,
    proxyRequestOrigin: {
        protocol: 'https',
    },
    serverBefore: './src/server/before.js',

    /**************************************************************************
     * 打包 & Webpack
     *************************************************************************/
    // ! 请查阅文档中有关 Webpack 设定的注意事项
    // ! https://koot.js.org/#/config?id=webpackconfig
    webpackConfig: async () => ({
        entry: {
            /**
             * 自定入口文件，需要手动编写使用逻辑
             * - 该模板项目中，本 `critical` 入口的结果会被自动写入到 HTML 结果内，位于 `<body>` 标签中所有自动插入的 `<script>` 标签之前
             * - 详见模板文件 `/src/index.ejs` 内的 `<%- content('critical.js') %>`
             */
            critical: [path.resolve(__dirname, './src/critical.js')],

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
                    loader: 'url-loader',
                    options: {
                        limit: 2 * 1024,
                    },
                },
                {
                    test: /\.(ttf|ttc|eot|woff|woff2)$/,
                    loader: 'file-loader',
                },
                {
                    test: /\.svg$/,
                    loader: 'svg-url-loader',
                    exclude: /node_modules/,
                    options: {
                        noquotes: true,
                        limit: 5 * 1024,
                    },
                },
            ],
        },
    }),
    staticCopyFrom: path.resolve(__dirname, './src/assets/public'),

    /**************************************************************************
     * 开发环境 & 开发设置
     *************************************************************************/
    aliases: {
        '@src': path.resolve('./src'),
        '@assets': path.resolve('./src/assets'),
        '@components': path.resolve('./src/components'),
        '@constants': path.resolve('./src/constants'),
        '@locales': path.resolve('./src/locales'),
        '@routes': path.resolve('./src/routes'),
        '@server': path.resolve('./src/server'),
        '@store': path.resolve('./src/store'),
        '@views': path.resolve('./src/views'),
        '~vars.less': path.resolve('./src/constants/less/_all.less'),
        '@types': path.resolve('./types'),
    },
    defines: {
        __SVG_ICON_PACK__: JSON.stringify(
            fs.readFileSync(
                path.resolve(__dirname, './src/assets/symbol-defs.svg'),
                'utf-8'
            )
        ).replace(/\n/g, ''),
    },
    devPort: 3088,

    /**************************************************************************
     * 更多选项请查阅[文档](https://koot.js.org/#/config)
     *************************************************************************/
};
