/* eslint-disable no-console */

const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');
const webpack = require('webpack');
const sanitize = require('sanitize-filename');
const resolveFunc = require('resolve');
const inquirer = require('inquirer');
const merge = require('lodash/merge');
const sharp = require('sharp');
const spinner = require('koot-cli-kit/spinner');
const spawn = require('koot-cli-kit/spawn');

const {
    keyConfigIcons,
    buildManifestFilename,
} = require('koot/defaults/before-build');
const getDirDevTmp = require('koot/libs/get-dir-dev-tmp');
const getLogMsg = require('koot/libs/get-log-msg');
const isFromStartCommand = require('koot/libs/is-from-start-command');
const getCwd = require('koot/utils/get-cwd');
const newWebpackConfig = require('koot-webpack/libs/new-client-webpack-config');

const __ = require('./translate');

const defaultWebpackConfigMain = require('./defaults/webpack-config-main');
const defaultDistPackageJson = require('./defaults/dist-package-json');
const { getElectronFilesFolder } = require('../index.js');

// ============================================================================

/**
 * 修改 appConfig
 */
const afterBuild = async (kootConfigWithExtra) => {
    // 打包 Electron 启动脚本
    await buildElectronMain(kootConfigWithExtra);

    // 如果是生产环境，Pack Electron App
    if (process.env.WEBPACK_BUILD_ENV === 'dev') {
    } else if (!isFromStartCommand()) {
        console.log(' ');
        const { doPackaging } = await inquirer.prompt({
            type: 'confirm',
            name: 'doPackaging',
            message: getLogMsg(false, 'electron', __('question_do_packaging')),
            default: false,
        });
        if (doPackaging) await packElectron(kootConfigWithExtra);
        else console.log(' ');
    }
};

module.exports = afterBuild;

// ============================================================================

/**
 * @property {String} [main]
 * @property {String} [packageJson]
 */
const files = {};
let electronMainProcess;
let electronMainProcessActive = false;

/**
 * 构建 Electron 主进程 JS 文件
 * - 生产环境: 仅打包
 * - 开发环境: 热更新打包，并自动打开主进程
 * 构建完成后，会在同目录下生成 `package.json` 文件
 */
const buildElectronMain = async (appConfig) =>
    new Promise(async (resolve, reject) => {
        const { electron: electronConfig = {} } = appConfig;
        const outputPath = getElectronFilesFolder(appConfig);
        const {
            main,
            mainOutput,
            /** electron-builder 配置对象，会写入到打包结果的 `package.json` 中 */
            build = {},
        } = electronConfig;
        const msg = getLogMsg(
            false,
            'electron',
            __('building_main', { file: mainOutput })
        );
        const waiting = spinner(msg + '...');

        files.main = path.resolve(outputPath, mainOutput);
        files.packageJson = path.resolve(outputPath, 'package.json');

        const cwd = getCwd();
        const projectPkg = require(path.resolve(cwd, 'package.json'));
        const installedElectronDir = path.dirname(
            resolveFunc.sync('electron', {
                basedir: cwd,
            })
        );
        const installedElectronVersion = require(path.resolve(
            installedElectronDir,
            'package.json'
        )).version;

        const thisConfig = await newWebpackConfig(
            merge({}, defaultWebpackConfigMain, {
                mode:
                    process.env.WEBPACK_BUILD_ENV === 'dev'
                        ? 'development'
                        : 'production',
                name: 'koot-electron-main',
                target: 'electron-main',
                entry: {
                    main,
                },
                output: {
                    path: outputPath,
                },
                node: {
                    global: true,
                },
                watch: process.env.WEBPACK_BUILD_ENV === 'dev' ? true : false,
                optimization: {
                    splitChunks: false,
                    removeAvailableModules: false,
                    mergeDuplicateChunks: false,
                    concatenateModules: false,
                },
                performance: {
                    maxEntrypointSize: 100 * 1024 * 1024,
                    maxAssetSize: 100 * 1024 * 1024,
                },
                stats: 'summary',
            }),
            appConfig
        );

        thisConfig.plugins.push({
            apply: (compiler) => {
                // 输出文件后执行
                compiler.hooks.afterEmit.tap(
                    'KootElectronBuildMainAfterEmitPlugin',
                    (compilation) => {
                        // 添加 package.json
                        fs.writeJsonSync(
                            files.packageJson,
                            merge({}, defaultDistPackageJson, {
                                name: sanitize(appConfig.name || '')
                                    .toLowerCase()
                                    .replace(/ /g, '-'),
                                main: path.relative(
                                    path.dirname(files.packageJson),
                                    files.main
                                ),
                                description:
                                    projectPkg.description ||
                                    defaultDistPackageJson.description,
                                version:
                                    projectPkg.version ||
                                    defaultDistPackageJson.version,
                                author:
                                    projectPkg.author ||
                                    defaultDistPackageJson.author,
                                build,
                                devDependencies: {
                                    electron: installedElectronVersion,
                                },
                            }),
                            {
                                spaces: 4,
                            }
                        );

                        // 如果是开发环境，自动杀死 Electron 主进程（如果有），并打开主进程
                        if (process.env.WEBPACK_BUILD_ENV === 'dev') {
                            if (electronMainProcessActive) {
                                killAll(electronMainProcess.pid).then(() => {
                                    electronMainProcess = undefined;
                                    openElectronMainProcess(appConfig);
                                });
                            } else {
                                // 等待 buildManifestFilename 文件出现
                                const fileFlagBuilding = path.resolve(
                                    getDirDevTmp(),
                                    buildManifestFilename
                                );
                                new Promise((resolve) => {
                                    const wait = () =>
                                        setTimeout(() => {
                                            if (fs.existsSync(fileFlagBuilding))
                                                return resolve();
                                            wait();
                                        }, 500);
                                    wait();
                                }).then(() => {
                                    openElectronMainProcess(appConfig);
                                });
                            }
                        }
                    }
                );
            },
        });

        // console.log(thisConfig)

        try {
            webpack(thisConfig, (err, stats) => {
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
        } catch (err) {
            waiting.fail();
            console.error(err);
            reject(err);
        }
    });

/**
 * 打开 Electron 主进程
 */
const openElectronMainProcess = async (appConfig) => {
    if (electronMainProcessActive) return;

    const { main } = files;
    const mainDir = path.dirname(main);
    const cwd = getCwd();

    const cmd = `electron ${mainDir}`;
    const chunks = cmd.split(' ');
    electronMainProcess = require('child_process').spawn(
        chunks.shift(),
        chunks,
        {
            stdio: 'inherit',
            shell: true,
            cwd,
            detached: process.platform !== 'win32',
        }
    );
    electronMainProcessActive = true;

    electronMainProcess.on('close', () => {
        console.log(' ');
        console.log(getLogMsg('warning', 'electron', __('dev_window_closed')));
        console.log(' ');
        electronMainProcessActive = false;
    });
    electronMainProcess.on('error', (...args) => {
        console.error(...args);
    });
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
    const cwd = appConfig.dist;
    const appIcon =
        typeof appConfig[keyConfigIcons] === 'object'
            ? appConfig[keyConfigIcons].square ||
              appConfig[keyConfigIcons].original
            : undefined;
    const { build = {} } = await fs.readJson(
        path.resolve(appConfig.dist, 'package.json')
    );
    const {
        directories: { buildResources },
    } = build;
    const buildResourcesFolder = path.isAbsolute(buildResources)
        ? buildResources
        : path.resolve(cwd, buildResources);

    // console.log({
    //     cwd,
    //     appIcon,
    //     build,
    //     buildResourcesFolder,
    // });

    await fs.ensureDir(buildResourcesFolder);

    if (appIcon) {
        const image = await sharp(appIcon);
        const target = path.resolve(buildResourcesFolder, 'icon.png');
        if ((await image.metadata()).format === 'png') {
            await fs.copy(appIcon, target);
        } else {
            await image.png().toFile(target);
        }
    }

    await spawn(`electron-builder build ${args.join(' ')}`, {
        cwd,
    });
};

/**
 * https://medium.com/@almenon214/killing-processes-with-node-772ffdd19aad
 *
 * kills the process and all its children
 * If you are on linux process needs to be launched in detached state
 * @param pid process identifier
 * @param signal kill signal
 */
const killAll = (pid, signal = 'SIGTERM') =>
    new Promise((resolve, reject) => {
        if (process.platform === 'win32') {
            exec(`taskkill /PID ${pid} /T /F`, (error, stdout, stderr) => {
                // console.log("taskkill stdout: " + stdout)
                // console.log("taskkill stderr: " + stderr)
                if (error) {
                    // console.log("error: " + error.message)
                    return reject(error);
                }
                resolve(stdout);
            });
        } else {
            // see https://nodejs.org/api/child_process.html#child_process_options_detached
            // If pid is less than -1, then sig is sent to every process in the process group whose ID is -pid.
            process.kill(-pid, signal);
            resolve();
        }
    });
