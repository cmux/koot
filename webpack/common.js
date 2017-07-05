const fs = require('fs')
const webpack = require('webpack')
const autoprefixer = require('autoprefixer')
const pxtorem = require('postcss-pxtorem')
const path = require('path')
const appPath = process.cwd()

// 执行顺序，从右到左
const rules = [{
    test: /\.json$/,
    loader: 'json-loader'
}, {
    test: /\.css$/,
    exclude: /\.g\.css$/,
    loader: 'sp-css-loader?length=4&mode=replace!postcss-loader'
}, {
    test: /\.less$/,
    exclude: /\.g\.less$/,
    loader: 'sp-css-loader?length=4&mode=replace!postcss-loader!less-loader'
}, {
    test: /\.scss$/,
    exclude: /\.g\.scss$/,
    loader: 'sp-css-loader?length=4&mode=replace!postcss-loader!sass-loader'
}, {
    test: /\.g\.css$/,
    use: [
        {
            loader: 'style-loader'
        },
        {
            loader: 'css-loader',
            options: {
                camelCase: true,
                autoprefixer: {
                    add: true
                }
            }
        }
    ]
}, {
    test: /\.g\.less$/,
    use: [
        {
            loader: 'style-loader'
        },
        {
            loader: 'css-loader',
            options: {
                camelCase: true,
                autoprefixer: {
                    add: true
                }
            }
        },
        {
            loader: 'less-loader'
        }
    ]
}, {
    test: /\.g\.scss$/,
    use: [
        {
            loader: 'style-loader'
        },
        {
            loader: 'css-loader',
            options: {
                camelCase: true,
                autoprefixer: {
                    add: true
                }
            }
        },
        {
            loader: 'sass-loader'
        }
    ]
}, {
    test: /\.png$/,
    loader: 'url-loader?limit=1&name=assets/[hash:5].[ext]'
}, {
    test: /\.(ico|gif|jpg|jpeg|svg|webp)$/,
    loader: 'file-loader?context=static&name=assets/[hash:5].[ext]',
    exclude: /node_modules/
}, {
    test: /\.(js|jsx)$/,
    use: [{
        loader: 'babel-loader'
    }]
}, {
    test: /\.md$/,
    include: [
        path.resolve(appPath, "docs")
    ],
    use: [
        // {
        //     loader: "html-loader"
        // },
        // {
        //     loader: "markdown-loader",
        //     options: {
        //         /* your options here */
        //     }
        // }
        {
            loader: 'raw-loader'
        }
    ]
}]

// 执行顺序，？
const plugins = [
    new webpack.LoaderOptionsPlugin({
        options: {
            postcss: function () {
                return [
                    // https://github.com/postcss/postcss-import
                    // postcssImport({
                    //     addDependencyTo: webpack
                    // }),
                    autoprefixer({
                        // browsers: [
                        //     'Chrome >= 20',
                        //     'Edge >= 12',
                        //     'Firefox >= 20',
                        //     'ie >= 11',
                        //     'iOS >= 5',
                        //     'Android >= 2',
                        //     'ChromeAndroid >= 20',
                        //     'ExplorerMobile >= 11'
                        // ]
                    }),
                    pxtorem({
                        rootValue: 20,
                        propList: ['*']
                    })
                ]
            }
        }
    })
]

const resolve = {
    modules: [
        'node_modules',
        path.resolve(appPath, './src/modules')
    ],
    alias: {
        Config: path.resolve(appPath, './src/client/config'),
        Locales: path.resolve(appPath, './src/locales'),
        Utils: path.resolve(appPath, './src/utils'),
        Assets: path.resolve(appPath, './src/client/assets'),
        UI: path.resolve(appPath, './src/client/ui'),
        Docs: path.resolve(appPath, './docs')
    },
    extensions: ['.js', '.jsx', '.json', '.css', '.less']
}

// 这里配置需要babel处理的node_modules
// 大部分是自己用es6语法写的模块
const needBabelHandleList = [
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
    'sp-i18n'
]

// https://github.com/webpack/webpack/issues/2852
// webpack 在打包服务端依赖 node_modules 的时候易出错，
// 所以把 package.json 里描述的依赖过滤掉，只打包自己写的代码
// 注：在上线的时候需要需要自行安装 package.json 的依赖包
const filterExternalsModules = () => fs
    .readdirSync(path.resolve(__dirname, '..', 'node_modules'))
    .concat(['react-dom/server'])
    .filter((x) => ['.bin'].concat(needBabelHandleList).indexOf(x) === -1)
    .filter((x) => !/^sp\-/.test(x))
    .reduce((ext, mod) => {
        ext[mod] = ['commonjs', mod].join(' ') // eslint-disable-line no-param-reassign
        return ext
    }, {})

module.exports = {
    rules,
    plugins,
    resolve,
    needBabelHandleList,
    filterExternalsModules
}