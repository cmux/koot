const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
// const ExtractTextPlugin = require("extract-text-webpack-plugin")
// const MiniCssExtractPlugin = require("mini-css-extract-plugin")

const createModuleRules = require('koot-webpack/factory-config/module/rules')
const defaultDefines = require('../../defaults/defines')
const { keyConfigBuildDll } = require('../../defaults/before-build')
const getPathnameProjectConfigFile = require('../../utils/get-pathname-project-config-file')
const readBaseConfig = require('../../utils/read-base-config')

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
    ...remainingKootBuildConfig
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
                createDll,
                ...remainingKootBuildConfig
            })
        },
        resolve: {
            alias: { ...aliases },
            modules: [
                '__modules',
                'node_modules'
            ],
            extensions: ['.js', '.jsx', '.mjs', '.json', '.css', '.less', '.sass', '.scss']
        },
        plugins: await plugins(env, stage, defines, remainingKootBuildConfig)
    }
}


// 执行顺序, 先 -> 后
const plugins = async (env, stage, defines = {}/*, remainingKootBuildConfig = {}*/) => {
    const _defaultDefines = {}
    Object.keys(defaultDefines).forEach(key => {
        _defaultDefines[key] = JSON.stringify(defaultDefines[key])
    })

    const thisDefines = Object.assign(
        _defaultDefines,
        {
            __CLIENT__: stage == 'client',
            __SERVER__: stage == 'server',
            __DEV__: env == 'dev',
            __PROD__: env == 'prod',
            __PRO__: env == 'prod',
            __TEST__: false,
            __QA__: false,
            __PREPROD__: false,
            // '__SPA__': !!spa,
            // __DIST__: JSON.stringify(process.env.KOOT_DIST_DIR),

            // 将 SERVER_PORT 赋值
            // 服务器启动时，会优先选取当前环境变量中的 SERVER_PORT，如果没有，会选择 __SERVER_PORT__
            __SERVER_PORT__: JSON.stringify(process.env.SERVER_PORT),
        },
        defines
    )

    for (let key in thisDefines) {
        if (typeof thisDefines[key] === 'function')
            thisDefines[key] = thisDefines[key]()
    }

    if (env == 'prod') {
        process.env.NODE_ENV = 'production'
        // g['process.env'] = {
        //     'NODE_ENV': JSON.stringify('production')
        // }
    }

    const envsToDefine = [
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

    const moduleReplacements = [
        [/^__KOOT_PROJECT_CONFIG_FULL_PATHNAME__$/, getPathnameProjectConfigFile()],
        [/^__KOOT_PROJECT_CONFIG_PORTION_PATHNAME__$/, getPathnameProjectConfigFile(true)],
        [
            /^__KOOT_HOC_EXTEND__$/,
            (() => {
                if (/^React/.test(process.env.KOOT_PROJECT_TYPE))
                    return path.resolve(__dirname, '../../React/component-extender.js')
            })()
        ],
        // [
        //     /^__KOOT_HOC_PAGEINFO__$/,
        //     (() => {
        //         if (/^React/.test(process.env.KOOT_PROJECT_TYPE))
        //             return path.resolve(__dirname, '../../React/pageinfo.js')
        //     })()
        // ],
    ]

    const historyType = process.env.KOOT_HISTORY_TYPE
    if (historyType) {
        moduleReplacements.push([
            /^__KOOT_CLIENT_REQUIRE_CREATE_HISTORY__$/,
            `history/lib/create${historyType.substr(0, 1).toUpperCase() + historyType.substr(1)}`
        ])
        moduleReplacements.push([
            /^__KOOT_CLIENT_REQUIRE_HISTORY__$/,
            `react-router/lib/${historyType}`
        ])
    }

    return [
        new webpack.DefinePlugin(thisDefines),
        new webpack.EnvironmentPlugin(envsToDefine.filter(key => (
            typeof process.env[key] !== 'undefined'
        ))),
        ...moduleReplacements.map(([regex, value]) =>
            new webpack.NormalModuleReplacementPlugin(regex, value)
        ),
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
    extensions: ['.js', '.jsx', '.mjs', '.json', '.css', '.less', '.sass', '.scss']
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
