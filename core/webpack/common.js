const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
// const ExtractTextPlugin = require("extract-text-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")

const pwaCreatePlugin = require('sp-pwa')
const getAppType = require('../../utils/get-app-type')

const {
    WEBPACK_BUILD_ENV: ENV,
    // WEBPACK_BUILD_STAGE: STAGE,
} = process.env

// 打包结果目录
const outputPath = 'dist'

// 服务端入库文件
const serverEntries = ((/*appPath*/) => [
    'babel-core/register',
    'babel-polyfill',
    path.resolve(
        // __dirname, '../start'
        __dirname,
        '../../',
        getAppType(),
        './server'
    )
])

// 执行顺序，从右到左
const factory = async ({
    aliases,
    env, stage, spa = false,
}) => {
    const useSpCssLoader = 'sp-css-loader?length=8&mode=replace'
    const useUniversalAliasLoader = {
        loader: "universal-alias-loader",
        options: {
            alias: aliases
        }
    }

    const extractCSS = ENV === 'prod' ? true : false

    return {
        module: {
            rules: [
                // {
                //     test: /\.json$/,
                //     loader: 'json-loader'
                // },

                // CSS - general
                {
                    test: /\.css$/,
                    exclude: [/\.g\.css$/, /node_modules/],
                    use: [
                        useSpCssLoader,
                        "postcss-loader",
                        useUniversalAliasLoader
                    ]
                }, {
                    test: /\.less$/,
                    exclude: [/\.g\.less$/, /node_modules/],
                    use: [
                        useSpCssLoader,
                        "postcss-loader",
                        "less-loader",
                        useUniversalAliasLoader
                    ]
                }, {
                    test: /\.scss$/,
                    exclude: [/\.g\.scss$/, /node_modules/],
                    use: [
                        useSpCssLoader,
                        "postcss-loader",
                        "sass-loader",
                        useUniversalAliasLoader
                    ]
                },

                // CSS - in node_modules
                {
                    test: /\.css$/,
                    include: /node_modules/,
                    use: [
                        "style-loader",
                        "postcss-loader"
                    ]
                }, {
                    test: /\.less$/,
                    include: /node_modules/,
                    use: [
                        "style-loader",
                        "postcss-loader",
                        "less-loader"
                    ]
                }, {
                    test: /\.scss$/,
                    include: /node_modules/,
                    use: [
                        "style-loader",
                        "postcss-loader",
                        "sass-loader"
                    ]
                },

                // CSS - critical
                {
                    test: extractCSS ? /critical\.g\.css$/ : /^IMPOSSIBLE$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        "css-loader",
                        "postcss-loader"
                    ]
                    // use: ExtractTextPlugin.extract({
                    //     fallback: "style-loader",
                    //     use: ["css-loader", "postcss-loader"]
                    // })
                }, {
                    test: extractCSS ? /critical\.g\.less$/ : /^IMPOSSIBLE$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        "css-loader",
                        "postcss-loader",
                        "less-loader"
                    ]
                    // use: ExtractTextPlugin.extract({
                    //     fallback: "style-loader",
                    //     use: ["css-loader", "postcss-loader", "less-loader"]
                    // })
                }, {
                    test: extractCSS ? /critical\.g\.scss$/ : /^IMPOSSIBLE$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        "css-loader",
                        "postcss-loader",
                        "sass-loader"
                    ]
                    // use: ExtractTextPlugin.extract({
                    //     fallback: "style-loader",
                    //     use: ["css-loader", "postcss-loader", "sass-loader"]
                    // })
                },

                // CSS - other global
                {
                    test: /\.g\.css$/,
                    exclude: extractCSS ? /critical\.g\.css$/ : undefined,
                    loader: 'style-loader!postcss-loader'
                }, {
                    test: /\.g\.less$/,
                    exclude: extractCSS ? /critical\.g\.less$/ : undefined,
                    loader: 'style-loader!postcss-loader!less-loader'
                }, {
                    test: /\.g\.scss$/,
                    exclude: extractCSS ? /critical\.g\.scss$/ : undefined,
                    loader: 'style-loader!postcss-loader!sass-loader'
                },

                //

                {
                    test: /\.(js|jsx)$/,
                    loader: 'babel-loader'
                }
            ]
        },
        resolve: {
            alias: { ...aliases },
            modules: [
                '__modules',
                'node_modules'
            ],
            extensions: ['.js', '.jsx', '.json', '.css', '.less', '.sass', '.scss']
        },
        plugins: plugins(env, stage, spa)
    }
}


// 执行顺序, 先 -> 后
const plugins = (env, stage, spa = false) => {

    let g = {
        '__CLIENT__': stage == 'client',
        '__SERVER__': stage == 'server',
        '__DEV__': env == 'dev',
        '__PROD__': env == 'prod',
        '__SPA__': !!spa,
        '__DIST__': JSON.stringify(process.env.SUPER_DIST_DIR),
    }

    if (env == 'prod') {
        process.env.NODE_ENV = 'production'
        // g['process.env'] = {
        //     'NODE_ENV': JSON.stringify('production')
        // }
    }

    return [
        new webpack.DefinePlugin(g),
        new webpack.EnvironmentPlugin([
            'SUPER_DIST_DIR',
            'SUPER_I18N',
            'SUPER_I18N_TYPE',
            "SUPER_I18N_LOCALES",
            "WEBPACK_CHUNKMAP",
            // "WEBPACK_SERVER_PUBLIC_PATH",
        ]),
    ]
}

const factoryPWAPlugin = (opt) => {

    let config = {
        outputPath: '',//path.resolve(opt.outputPath, '../'),  // 子应用打包后文件夹的上一级
        outputFilename: `service-worker.${opt.appName}.js`,
        // customServiceWorkerPath: path.normalize(appPath + '/src/client/custom-service-worker.js'),
        globPattern: `/${opt.appName}/**/*`,
        // globOptions: {
        //     ignore: [
        //         '/**/portals/',
        //         '/**/portals/**/*'
        //     ]
        // }
    }

    Object.assign(config, opt)

    return pwaCreatePlugin(config)
}

const resolve = Object.assign({
    modules: [
        '__modules',
        'node_modules'
    ],
    alias: {
        // Apps: path.resolve(appPath, './apps'),
        // "@app": path.resolve(appPath, './apps/app')
    },
    extensions: ['.js', '.jsx', '.json', '.css', '.less', '.sass', '.scss']
})


// 这里配置需要babel处理的node_modules
// 大部分是自己用es6语法写的模块
const needBabelHandleList = [
    'super-project',
    'sp-base',
    'sp-boilerplate',
    'sp-css-import',
    'sp-css-loader',
    'sp-mongo',
    'sp-api',
    'sp-cors-middleware',
    'sp-react-isomorphic',
    'sp-model',
    'sp-cms',
    'sp-auth',
    'sp-koa-views',
    'sp-response',
    'sp-upload',
    'sp-i18n',
    'super-i18n',
    'super-ui-pagecontainer',
]

// https://github.com/webpack/webpack/issues/2852
// webpack 在打包服务端依赖 node_modules 的时候易出错，
// 所以把 package.json 里描述的依赖过滤掉，只打包自己写的代码
// 注：在上线的时候需要需要自行安装 package.json 的依赖包
const filterExternalsModules = () => fs
    // .readdirSync(path.resolve(__dirname, '../../', 'node_modules'))
    .readdirSync(path.resolve(__dirname, '../../../'))
    .concat(['react-dom/server'])
    .filter((x) => ['.bin'].concat(needBabelHandleList).indexOf(x) === -1)
    .filter((x) => !/^sp-/.test(x))
    .filter((x) => !/^super-/.test(x))
    .reduce((ext, mod) => {
        ext[mod] = ['commonjs', mod].join(' ') // eslint-disable-line no-param-reassign
        return ext
    }, {})

// 已下属都可以在 /config/webpack.js 中扩展
module.exports = {
    factory,

    outputPath,
    serverEntries,
    // rules,
    plugins,
    factoryPWAPlugin,
    resolve,
    needBabelHandleList,
    filterExternalsModules
}
