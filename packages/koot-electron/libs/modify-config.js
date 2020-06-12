/* eslint-disable no-console */

const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const webpack = require('webpack');
const sanitize = require('sanitize-filename');
const resolve = require('resolve');
const inquirer = require('inquirer');
const merge = require('lodash/merge');
const spinner = require('koot-cli-kit/spinner');
const spawn = require('koot-cli-kit/spawn');

const {
    keyConfigWebpackSPATemplateInject,
    keyConfigBuildDll,
    CLIENT_ROOT_PATH,
} = require('koot/defaults/before-build');
const getDirDevTmp = require('koot/libs/get-dir-dev-tmp');
const getLogMsg = require('koot/libs/get-log-msg');
const isFromStartCommand = require('koot/libs/is-from-start-command');
const getCwd = require('koot/utils/get-cwd');
const newWebpackConfig = require('koot-webpack/libs/new-client-webpack-config');

const __ = require('./translate');

const defaultWebpackConfigMain = require('./defaults/webpack-config-main');
const defaultDistPackageJson = require('./defaults/dist-package-json');

// ============================================================================

const modifyConfig = async (appConfig) => {
    if (appConfig[keyConfigBuildDll]) return;

    if (typeof appConfig !== 'object')
        throw new Error('MISSING_PARAMETER: appConfig');

    const { webpackConfig, webpackBefore, webpackAfter } = appConfig;

    // 修改 dist
    // appConfig.dist = path.resolve(appConfig.dist, 'build');

    // 修改 Webpack 配置
    appConfig.webpackConfig = await modifyWebpackConfig(
        webpackConfig,
        appConfig
    );

    // before - 打包 Electron 启动脚本
    appConfig.webpackBefore = async (...args) => {
        await buildElectronMain(...args);
        if (typeof webpackBefore === 'function') await webpackBefore(...args);
    };

    // after - 如果是开发环境，自动启动；如果是生产环境，Pack Electron App
    appConfig.webpackAfter = async (...args) => {
        if (process.env.WEBPACK_BUILD_ENV === 'dev') {
            await afterBuildAutoOpen(...args);
        } else if (!isFromStartCommand()) {
            console.log(' ');
            const { doPackaging } = await inquirer.prompt({
                type: 'confirm',
                name: 'doPackaging',
                message: getLogMsg(
                    false,
                    'electron',
                    __('question_do_packaging')
                ),
                default: false,
            });
            if (doPackaging) await packElectron(...args);
            else console.log(' ');
        }
        if (typeof webpackAfter === 'function') await webpackAfter(...args);
    };

    return appConfig;
};

module.exports = modifyConfig;

// ============================================================================

const files = {};

const getElectronFilesFolder = (appConfig) =>
    process.env.WEBPACK_BUILD_ENV === 'dev'
        ? getDirDevTmp('electron')
        : path.resolve(appConfig[CLIENT_ROOT_PATH]);

const buildElectronMain = async (appConfig) => {
    const dest = getElectronFilesFolder(appConfig);
    const { electron: electronConfig = {}, dist } = appConfig;
    const { main, mainOutput, build = {} } = electronConfig;
    const msg = getLogMsg(
        false,
        'electron',
        __('building_main', { file: mainOutput })
    );
    const waiting = spinner(msg + '...');

    files.main = path.resolve(dest, mainOutput);

    const cwd = getCwd();
    const projectPkg = require(path.resolve(cwd, 'package.json'));
    const installedElectronDir = path.dirname(
        resolve.sync('electron', {
            basedir: cwd,
        })
    );
    const installedElectronVersion = require(path.resolve(
        installedElectronDir,
        'package.json'
    )).version;
    const webpackConfig = await newWebpackConfig(
        merge({}, defaultWebpackConfigMain, {
            entry: {
                main,
            },
            output: {
                path: dest,
            },
        }),
        appConfig
    );

    // console.log('buildElectronMain', {
    //     dest,
    //     electronConfig,
    //     webpackConfig,
    // });

    try {
        await new Promise((resolve, reject) => {
            webpack(webpackConfig, (err, stats) => {
                if (err) return reject(err);

                const info = stats.toJson();

                if (stats.hasWarnings() || stats.hasErrors()) {
                    console.log(
                        stats.toString({
                            chunks: false,
                            colors: true,
                        })
                    );
                    if (stats.hasWarnings()) console.warn(info.warnings);
                    if (stats.hasErrors()) console.warn(info.errors);
                }

                waiting.stop();
                spinner(msg).succeed();
                resolve(stats);
            });
        });
    } catch (err) {
        waiting.fail();
        console.error(err);
        throw err;
    }

    // 添加 package.json
    await fs.writeJson(
        path.resolve(dist, 'package.json'),
        merge({}, defaultDistPackageJson, {
            name: sanitize(appConfig.name || '')
                .toLowerCase()
                .replace(/ /g, '-'),
            main: path.relative(dist, files.main),
            description:
                projectPkg.description || defaultDistPackageJson.description,
            version: projectPkg.version || defaultDistPackageJson.version,
            author: projectPkg.author || defaultDistPackageJson.author,
            build,
            devDependencies: {
                electron: installedElectronVersion,
            },
        }),
        {
            spaces: 4,
        }
    );
};

let opened = false;
// let doKill = false;
const afterBuildAutoOpen = async (appConfig) => {
    if (opened) return;

    const { main } = files;
    const cwd = getCwd();

    const cmd = `electron ${main}`;
    const chunks = cmd.split(' ');
    const child = require('child_process').spawn(chunks.shift(), chunks, {
        stdio: 'inherit',
        shell: true,
        cwd,
    });
    opened = true;

    child.on('close', () => {
        // if (!doKill)
        console.log(' ');
        console.log(getLogMsg('warning', 'electron', __('dev_window_closed')));
        console.log(' ');
        opened = false;
        // process.exit(1);
    });
    child.on('error', (...args) => {
        console.error(...args);
    });
    // const exitHandler = async (...args) => {
    //     doKill = true;
    //     // child.kill('SIGINT');
    // };
    // process.on('exit', exitHandler);
    // process.on('SIGINT', exitHandler);
    // process.on('SIGUSR1', exitHandler);
    // process.on('SIGUSR2', exitHandler);
    // process.on('uncaughtException', exitHandler);
};

const packElectron = async (appConfig) => {
    const platform = os.platform();
    const { targets } = await inquirer.prompt({
        type: 'checkbox',
        name: 'targets',
        message: getLogMsg(false, 'electron', __('question_select_targets')),
        choices: [
            {
                name: 'Windows',
                value: '--win',
                checked: platform === 'win32',
            },
            {
                name:
                    'macOS' +
                    (platform !== 'darwin'
                        ? ` (${__('can_only_build_on_mac')})`
                        : ''),
                value: '--mac',
                disabled: platform !== 'darwin',
                checked: platform === 'darwin',
            },
            {
                name: 'Linux',
                value: '--linux',
            },
        ],
    });
    const args = [...targets];

    await spawn(`electron-builder build ${args.join(' ')}`, {
        cwd: appConfig.dist,
    });
};

const modifyWebpackConfig = async (webpackConfig, appConfig) => {
    if (typeof webpackConfig === 'object' && !Array.isArray(webpackConfig))
        return await modifyWebpackConfig([webpackConfig], appConfig);

    // ========================================================================
    //
    // 修改 target
    //
    // ========================================================================
    webpackConfig
        .filter((config) => !config[keyConfigWebpackSPATemplateInject])
        .forEach((config) => {
            config.target = 'electron-renderer';
        });

    // ========================================================================
    //
    // 调整最后一条配置
    //
    // ========================================================================

    // const lastConfig = webpackConfig
    //     .filter((config) => !config[keyConfigWebpackSPATemplateInject])
    //     .slice(-1)[0];

    // console.log('after modify', { webpackConfig, appConfig });

    return webpackConfig;
};
