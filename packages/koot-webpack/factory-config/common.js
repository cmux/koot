const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const requireResolve = require('resolve');
// const ExtractTextPlugin = require("extract-text-webpack-plugin")

const createModuleRules = require('./module/rules');
const KootResetCssLoaderPlugin = require('../plugins/reset-css-loader');
const defaultDefines = require('koot/defaults/defines');
const { KOOT_CLIENT_PUBLIC_PATH } = require('koot/defaults/envs');
const {
    keyConfigBuildDll,
    styleTagGlobalAttributeName,
    styleTagModuleAttributeName,
} = require('koot/defaults/before-build');
const getPathnameProjectConfigFile = require('koot/utils/get-pathname-project-config-file');
// const resolveDir = require('koot/utils/resolve-dir')
const getCwd = require('koot/utils/get-cwd');
// const readBaseConfig = require('koot/utils/read-base-config')
const isServerBundlingAllModules = require('../libs/is-server-bundling-all-modules');

// 打包结果目录
const outputPath = 'dist';

// 执行顺序，从右到左
const factory = async (
    {
        env = process.env.WEBPACK_BUILD_ENV,
        stage = process.env.WEBPACK_BUILD_STAGE,
        // spa = false,

        aliases = {},
        defines = {},
        css = {},
        [keyConfigBuildDll]: createDll = false,
        ...remainingKootBuildConfig
    },
    options = {}
) => {
    // const useSpCssLoader = {
    //     loader: 'sp-css-loader',
    //     options: {
    //         length: 4,
    //         mode: 'replace',
    //         readable: env === 'dev' ? 'true' : 'false',
    //     }
    // }

    const def = {
        module: {
            rules: createModuleRules(
                {
                    aliases,
                    defines,
                    css,
                    createDll,
                    ...remainingKootBuildConfig,
                },
                options
            ),
        },
        resolve: {
            ...resolve,
            alias: { ...resolve.alias, ...aliases },
        },
        plugins: await plugins(
            env,
            stage,
            defines,
            remainingKootBuildConfig,
            options
        ),
    };

    return def;
};

// 执行顺序, 先 -> 后
const plugins = async (
    env,
    stage,
    defines = {},
    remainingKootBuildConfig = {},
    options = {}
) => {
    const { localeId, isSPATemplateInject = false } = options;

    const _defaultDefines = {};
    Object.keys(defaultDefines).forEach((key) => {
        _defaultDefines[key] = JSON.stringify(defaultDefines[key]);
    });

    const constants = {
        __STYLE_TAG_GLOBAL_ATTR_NAME__: styleTagGlobalAttributeName,
        __STYLE_TAG_MODULE_ATTR_NAME__: styleTagModuleAttributeName,
    };

    const thisDefines = Object.assign(
        _defaultDefines,
        {
            __CLIENT__: stage === 'client',
            __SERVER__: stage === 'server',
            __DEV__: env === 'dev',
            __PROD__: env === 'prod',
            __PRO__: env === 'prod',
            __TEST__: false,
            __QA__: false,
            __PREPROD__: false,
            __KOOT_SPA_TEMPLATE_INJECT__: isSPATemplateInject === true,
            // '__SPA__': !!spa,
            // __DIST__: JSON.stringify(process.env.KOOT_DIST_DIR),

            // 将 SERVER_PORT 赋值
            // 服务器启动时，会优先选取当前环境变量中的 SERVER_PORT，如果没有，会选择 __SERVER_PORT__
            __SERVER_PORT__: JSON.stringify(process.env.SERVER_PORT),
        },
        Object.entries(constants).reduce((obj, [key, value]) => {
            obj[key] = JSON.stringify(value);
            return obj;
        }, {}),
        defines
    );

    for (const key in thisDefines) {
        if (typeof thisDefines[key] === 'function')
            thisDefines[key] = thisDefines[key]({ localeId });
    }

    if (env === 'prod') {
        process.env.NODE_ENV = 'production';
        // g['process.env'] = {
        //     'NODE_ENV': JSON.stringify('production')
        // }
    }

    // 打入环境变量
    const envsToDefine = [
        'KOOT_VERSION',
        'KOOT_PROJECT_NAME',
        'KOOT_PROJECT_TYPE',
        'KOOT_DIST_DIR',
        'KOOT_I18N',
        'KOOT_I18N_TYPE',
        'KOOT_I18N_LOCALES',
        'KOOT_I18N_COOKIE_KEY',
        'KOOT_I18N_COOKIE_DOMAIN',
        'KOOT_I18N_URL_USE',
        'KOOT_HTML_TEMPLATE',
        'KOOT_PWA_AUTO_REGISTER',
        'KOOT_PWA_PATHNAME',
        'KOOT_PWA_SCOPE',
        'KOOT_DEV_START_TIME',
        'KOOT_DEV_DLL_FILE_CLIENT',
        'KOOT_DEV_DLL_FILE_SERVER',
        'KOOT_SESSION_STORE',
        'KOOT_BUILD_TARGET',
        'KOOT_SSR_PUBLIC_PATH',
        'WEBPACK_BUILD_TYPE',
        'WEBPACK_BUILD_ENV',
        'WEBPACK_CHUNKMAP',
        'WEBPACK_DEV_SERVER_PORT',
        // "WEBPACK_SERVER_PUBLIC_PATH",
        KOOT_CLIENT_PUBLIC_PATH,
    ];
    if (
        remainingKootBuildConfig.sessionStore === true ||
        remainingKootBuildConfig.sessionStore === 'all' ||
        (typeof remainingKootBuildConfig.sessionStore === 'object' &&
            !Array.isArray(remainingKootBuildConfig.sessionStore))
    ) {
        process.env.KOOT_SESSION_STORE = JSON.stringify(
            remainingKootBuildConfig.sessionStore
        );
    } else {
        process.env.KOOT_SESSION_STORE = JSON.stringify(false);
    }

    JSON.parse(process.env.KOOT_CUSTOM_ENV_KEYS).forEach((key) => {
        if (typeof process.env[key] !== 'undefined') envsToDefine.push(key);
    });

    const moduleReplacements = [
        [
            /^__KOOT_PROJECT_CONFIG_FULL_PATHNAME__$/,
            getPathnameProjectConfigFile(),
        ],
        [
            /^__KOOT_PROJECT_CONFIG_PORTION_SERVER_PATHNAME__$/,
            getPathnameProjectConfigFile('server'),
        ],
        [
            /^__KOOT_PROJECT_CONFIG_PORTION_CLIENT_PATHNAME__$/,
            getPathnameProjectConfigFile('client'),
        ],
        [
            /^__KOOT_PROJECT_CONFIG_PORTION_OTHER_CLIENT_PATHNAME__$/,
            getPathnameProjectConfigFile('client-other'),
        ],
        [
            /^__KOOT_HOC_EXTEND__$/,
            (() => {
                if (/^React/.test(process.env.KOOT_PROJECT_TYPE))
                    return require('../libs/get-koot-file')(
                        'React/component-extender.jsx'
                    );
            })(),
        ],
        // [
        //     /^__KOOT_HOC_PAGEINFO__$/,
        //     (() => {
        //         if (/^React/.test(process.env.KOOT_PROJECT_TYPE))
        //             return path.resolve(__dirname, '../../React/pageinfo.js')
        //     })()
        // ],
    ];

    const historyType = process.env.KOOT_HISTORY_TYPE;
    if (historyType) {
        moduleReplacements.push([
            /^__KOOT_CLIENT_REQUIRE_CREATE_HISTORY__$/,
            `history/lib/create${
                historyType.substr(0, 1).toUpperCase() + historyType.substr(1)
            }`,
        ]);
        moduleReplacements.push([
            /^__KOOT_CLIENT_REQUIRE_HISTORY__$/,
            `react-router/lib/${historyType}`,
        ]);
    }

    return [
        new KootResetCssLoaderPlugin(),
        new webpack.DefinePlugin(thisDefines),
        new webpack.EnvironmentPlugin(
            envsToDefine.filter(
                (key) => typeof process.env[key] !== 'undefined'
            )
        ),
        ...moduleReplacements.map(
            ([regex, value]) =>
                new webpack.NormalModuleReplacementPlugin(regex, value)
        ),
    ];
};

const resolve = Object.assign({
    modules: ['__modules', 'node_modules'],
    alias: {
        // Apps: path.resolve(appPath, './apps'),
        // "@app": path.resolve(appPath, './apps/app')
    },
    extensions: [
        '.js',
        '.jsx',
        '.ts',
        '.tsx',
        '.mjs',
        '.cjs',
        // '.json',
        // '.css',
        // '.less',
        // '.sass',
        // '.scss'
    ],
});

// 这里配置需要babel处理的node_modules
// 大部分是自己用es6语法写的模块
const needBabelHandleList = ['koot'];

// https://github.com/webpack/webpack/issues/2852
// webpack 在打包服务端依赖 node_modules 的时候易出错，
// 所以把 package.json 里描述的依赖过滤掉，只打包自己写的代码
// 注：在上线的时候需要需要自行安装 package.json 的依赖包
const filterExternalsModules = (kootConfig = {}) => {
    if (isServerBundlingAllModules(kootConfig)) return [];

    const moduleDirectory = path.resolve(process.cwd(), 'node_modules');

    const externals = []
        .concat(fs.readdirSync(path.resolve(__dirname, '../../../')))
        .concat(fs.readdirSync(moduleDirectory))
        .concat(['react-dom/server'])
        .filter(
            (x) =>
                !['.bin'].concat(needBabelHandleList).includes(x) &&
                !/^sp-/.test(x) &&
                !/^koot-/.test(x) &&
                !/^@/.test(x) &&
                !/^workbox($|-)/.test(
                    x
                ) /** &&
                    require('../constants/ignored-dist-modules').every(
                        regex => !regex.test(x)
                    ) */
        )
        // .filter(x => !/^sp-/.test(x))
        // .filter(x => !/^super-/.test(x))
        // .filter(x => !/^koot-/.test(x))
        // .filter(x => !/^@/.test(x))
        // .filter(x => !/^workbox($|-)/.test(x))
        .reduce(async (ext, thisModule) => {
            let type;
            try {
                type = require(`${thisModule}/package.json`).type;
            } catch (e) {
                try {
                    const file = path.resolve(
                        requireResolve.sync(thisModule, { basedir: getCwd() }),
                        'package.json'
                    );
                    if (fs.existsSync(file))
                        type = JSON.parse(fs.readFileSync(file)).type;
                } catch (e) {
                    try {
                        const file = path.resolve(
                            moduleDirectory,
                            thisModule,
                            'package.json'
                        );
                        if (fs.existsSync(file))
                            type = JSON.parse(fs.readFileSync(file)).type;
                    } catch (e) {}
                }
            }
            // console.log(thisModule, type)
            ext[thisModule] = [
                type === 'module' ? 'module' : 'commonjs',
                thisModule,
            ].join(' '); // eslint-disable-line no-param-reassign
            // ext[thisModule] = thisModule + '' // eslint-disable-line no-param-reassign
            return ext;
        }, {});

    externals['@babel/register'] = ['commonjs', '@babel/register'].join(' ');
    // externals['@babel/polyfill'] = '@babel/polyfill'

    // console.log({ externals });

    return externals;
};

// 已下属都可以在 /config/webpack.js 中扩展
module.exports = {
    factory,

    outputPath,
    // rules,
    plugins,
    resolve,
    needBabelHandleList,
    filterExternalsModules,
};
