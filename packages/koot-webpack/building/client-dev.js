/* eslint-disable no-console */

require('koot/typedef');

const path = require('path');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const {
    keyConfigWebpackSPATemplateInject,
} = require('koot/defaults/before-build');
const getCwd = require('koot/utils/get-cwd');
// const getDistPath = require('koot/utils/get-dist-path');

const buildClient = require('../build-client');

/**
 * @async
 * 打包: 客户端 | 开发环境
 * @param {Object} param
 * @param {AppConfig} param.appConfig
 * @returns {Object} result 结果对象
 */
async function buildClientDev({
    appConfig = {},
    resultStats = {},

    appType,

    beforeEachBuild,
    onError,

    getStatus,

    log,
    logEmptyLine,
} = {}) {
    const { webpackConfig, devServer = {} } = appConfig;
    const { WEBPACK_BUILD_TYPE: TYPE } = process.env;

    // await sleep(20 * 1000)
    await beforeEachBuild();

    const configsSPATemplateInject = [];
    const configsClientDev = [];
    const watchFiles = [
        'template',
        'i18n',
        'routes',
        'store',
        // 'staticCopyFrom',
    ].reduce((list, key) => {
        const value = appConfig[key];
        if (typeof value === 'undefined') return list;

        switch (key) {
            case 'i18n': {
                // console.log(key, value);
                if (Array.isArray(value?.locales)) {
                    for (const [, , file] of value.locales) {
                        list.push(file);
                    }
                }
                break;
            }
            // case 'staticCopyFrom': {
            //     break;
            // }
            default: {
                list.push(path.resolve(getCwd(), value));
            }
        }

        return list;
    }, []);

    if (Array.isArray(webpackConfig)) {
        webpackConfig.forEach((config) => {
            if (config[keyConfigWebpackSPATemplateInject])
                configsSPATemplateInject.push(config);
            else configsClientDev.push(config);
        });
    } else {
        configsClientDev.push(webpackConfig);
    }

    for (const config of configsSPATemplateInject) {
        await buildClient(config)
            .then((err) => {
                if (err) return onError(err);
            })
            .catch((err) => {
                return onError(err);
            });
    }

    // ========================================================================
    //
    // Transform Configuration
    //
    // ========================================================================

    const {
        before,

        headers: optionHeaders = {},
        devMiddleware: optionDevMiddleware = {},
        client: optionClient = {},
        watchFiles: optionWatchFiles,

        publicPath: v3_publicPath,
        stats: v3_stats,
        clientLogLevel: v3_clientLogLevel,
        quiet: v3_quiet,

        watch: IGNORED_v3_watch,
        watchOptions: IGNORED_v3_watchOptions,
        contentBase: IGNORED_v3_contentBase,

        // port,
        ...extendDevServerOptions
    } = devServer;
    const port =
        TYPE === 'spa'
            ? process.env.SERVER_PORT
            : process.env.WEBPACK_DEV_SERVER_PORT;
    const devServerConfig = {
        // quiet: false,
        port,
        historyApiFallback: true,
        hot: true,
        // hot: 'only',

        // 打开页面的操作由 /bin/dev.js 管理并执行
        open: false,

        devMiddleware: {
            publicPath: v3_publicPath ?? (TYPE === 'spa' ? '/' : '/dist/'),
            stats: v3_stats ?? {
                preset: 'minimal',
                // copied from `'minimal'`
                all: false,
                modules: true,
                // maxModules: 0,
                errors: true,
                warnings: true,
                // our additional options
                moduleTrace: true,
                errorDetails: true,
            },
            ...optionDevMiddleware,
        },

        headers: {
            'Access-Control-Allow-Origin': '*',
            ...optionHeaders,
        },

        client: {
            logging: v3_clientLogLevel ?? 'info',
            // Can be `string`:
            // To get protocol/hostname/port from browser
            // webSocketURL: 'auto://0.0.0.0:0/ws'
            webSocketURL: {
                hostname: '0.0.0.0',
                pathname: '/ws',
                port: port,
            },
            ...optionClient,
        },

        watchFiles: Array.isArray(optionWatchFiles)
            ? [...watchFiles, ...optionWatchFiles]
            : typeof optionWatchFiles === 'object'
            ? { ...optionWatchFiles }
            : [...watchFiles],

        setupMiddlewares: (middlewares, devServer) => {
            if (
                appType === 'ReactSPA' ||
                appType === 'ReactElectronSPA' ||
                appType === 'ReactQiankunSPA'
            ) {
                require('koot/ReactSPA/dev-server/extend')(devServer.app);
            }
            if (typeof before === 'function') return before(devServer.app);
            // console.log(devServer);
            devServer.app.use(require('webpack-hot-middleware')(compiler));
            return middlewares;
        },

        ...extendDevServerOptions,
    };
    if (v3_quiet === true) {
        for (const config of configsClientDev) {
            if (typeof config.infrastructureLogging !== 'object')
                config.infrastructureLogging = {};
            config.infrastructureLogging.level = 'error';
        }
    }

    // ========================================================================
    //
    // Transform Configuration END
    //
    // ========================================================================

    // console.log('\n\ndevServer');
    // console.log(configsClientDev);
    // console.log(devServerConfig);

    const compiler = webpack(configsClientDev);

    // more config
    // https://webpack.js.org/configuration/dev-server
    const server = await new WebpackDevServer(devServerConfig, compiler);
    // console.log('server', server);

    try {
        await server.start();
        // server.listen(port, async (err) => {
        //     // if (err) console.error(err)
        //     if (err) onError(err);
        //     // console.log('===========')
        // });

        // 等待 building 标记为 false
        await new Promise((resolve) => {
            const wait = () =>
                setTimeout(() => {
                    if (getStatus().building === false) return resolve();
                    return wait();
                }, 500);
            wait();
        });

        if (TYPE !== 'spa') {
            logEmptyLine();
            log(
                'success',
                'dev',
                `webpack-dev-server @ http://localhost:${port}`
            );
        }
    } catch (e) {
        onError(e);
    }

    return resultStats;
}

module.exports = buildClientDev;
