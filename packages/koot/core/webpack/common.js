const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
// const ExtractTextPlugin = require("extract-text-webpack-plugin")
// const MiniCssExtractPlugin = require("mini-css-extract-plugin")

const createModuleRules = require('./config/create/module-rules')
const defaultDefines = require('../../defaults/defines.js')
const { keyConfigBuildDll } = require('../../defaults/before-build')
const getPathnameProjectConfigFile = require('../../utils/get-pathname-project-config-file')

// 打包结果目录
const outputPath = 'dist'

// 执行顺序，从右到左
const factory = async ({
    env = process.env.WEBPACK_BUILD_ENV,
    stage = process.env.WEBPACK_BUILD_STAGE,
    // spa = false,

    aliases,
    defines = {},
    css = {},
    [keyConfigBuildDll]: createDll = false,
}) => {

    // const useSpCssLoader = {
    //     loader: 'sp-css-loader',
    //     options: {
    //         length: 4,
    //         mode: 'replace',
    //         readable: env === 'dev' ? 'true' : 'false',
    //     }
    // }

    return {
        module: {
            rules: createModuleRules({
                aliases,
                defines,
                css,
                createDll
            })
        },
        resolve: {
            alias: { ...aliases },
            modules: [
                '__modules',
                'node_modules'
            ],
            extensions: ['.js', '.jsx', '.json', '.css', '.less', '.sass', '.scss']
        },
        plugins: plugins(env, stage, defines)
    }
}


// 执行顺序, 先 -> 后
const plugins = (env, stage, defines = {}) => {
    const defaults = {}
    Object.keys(defaultDefines).forEach(key => {
        defaults[key] = JSON.stringify(defaultDefines[key])
    })

    let g = Object.assign(
        defaults,
        {
            __CLIENT__: stage == 'client',
            __SERVER__: stage == 'server',
            __DEV__: env == 'dev',
            __PROD__: env == 'prod',
            // '__SPA__': !!spa,
            // __DIST__: JSON.stringify(process.env.KOOT_DIST_DIR),

            // 将 SERVER_PORT 赋值
            // 服务器启动时，会优先选取当前环境变量中的 SERVER_PORT，如果没有，会选择 __SERVER_PORT__
            __SERVER_PORT__: JSON.stringify(process.env.SERVER_PORT),

            // __KOOT_PROJECT_CONFIG_PATHNAME__: getPathnameProjectConfigFile(),
        },
        defines
    )

    if (env == 'prod') {
        process.env.NODE_ENV = 'production'
        // g['process.env'] = {
        //     'NODE_ENV': JSON.stringify('production')
        // }
    }

    const envs = [
        'KOOT_PROJECT_NAME',
        'KOOT_DIST_DIR',
        'KOOT_I18N',
        'KOOT_I18N_TYPE',
        "KOOT_I18N_LOCALES",
        "KOOT_I18N_COOKIE_KEY",
        "KOOT_I18N_COOKIE_DOMAIN",
        "KOOT_I18N_URL_USE",
        "KOOT_HTML_TEMPLATE",
        "KOOT_PWA_AUTO_REGISTER",
        "KOOT_PWA_PATHNAME",
        "WEBPACK_BUILD_TYPE",
        "WEBPACK_BUILD_ENV",
        "WEBPACK_CHUNKMAP",
        "WEBPACK_DEV_SERVER_PORT",
        // "WEBPACK_SERVER_PUBLIC_PATH",
    ]
    const envsToDefine = envs.filter(key => (
        typeof process.env[key] !== 'undefined'
    ))

    for (let key in g) {
        if (typeof g[key] === 'function')
            g[key] = g[key]()
    }

    return [
        new webpack.DefinePlugin(g),
        new webpack.EnvironmentPlugin(envsToDefine),
        // new webpack.ContextReplacementPlugin(
        //     /^__KOOT_PROJECT_CONFIG_PATHNAME__$/,
        //     (context) => {
        //         const a = Object.assign(context, {
        //             regExp: /^\.\/\w+/,
        //             request: getPathnameProjectConfigFile()
        //         })
        //         console.log(a)
        //     }
        // ),
        new webpack.NormalModuleReplacementPlugin(
            /^__KOOT_PROJECT_CONFIG_PATHNAME__$/,
            getPathnameProjectConfigFile()
        )
    ]
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
    'koot',
]

// https://github.com/webpack/webpack/issues/2852
// webpack 在打包服务端依赖 node_modules 的时候易出错，
// 所以把 package.json 里描述的依赖过滤掉，只打包自己写的代码
// 注：在上线的时候需要需要自行安装 package.json 的依赖包
const filterExternalsModules = () => {
    const externals = []
        .concat(fs.readdirSync(path.resolve(__dirname, '../../../')))
        .concat(fs.readdirSync(path.resolve(process.cwd(), 'node_modules')))
        .concat(['react-dom/server'])
        .filter((x) => ['.bin'].concat(needBabelHandleList).indexOf(x) === -1)
        .filter((x) => !/^sp-/.test(x))
        .filter((x) => !/^super-/.test(x))
        .filter((x) => !/^koot-/.test(x))
        .filter((x) => !/^@/.test(x))
        .reduce((ext, mod) => {
            ext[mod] = ['commonjs', mod].join(' ') // eslint-disable-line no-param-reassign
            // ext[mod] = mod + '' // eslint-disable-line no-param-reassign
            return ext
        }, {})

    externals['@babel/register'] = ['commonjs', '@babel/register'].join(' ')
    // externals['@babel/polyfill'] = '@babel/polyfill'

    return externals
}

// 已下属都可以在 /config/webpack.js 中扩展
module.exports = {
    factory,

    outputPath,
    // rules,
    plugins,
    resolve,
    needBabelHandleList,
    filterExternalsModules
}
