#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const program = require('commander');
const pm2 = require('pm2');
const chalk = require('chalk');
const npmRunScript = require('npm-run-script');
const opn = require('open');

const before = require('./_before');

const contentWaiting = require('../defaults/content-waiting');
const {
    keyFileProjectConfigTempFull,
    keyFileProjectConfigTempPortionServer,
    keyFileProjectConfigTempPortionClient,
    filenameWebpackDevServerPortTemp,
    filenameBuilding
    // filenameBuildFail,
    // filenameDll, filenameDllManifest,
} = require('../defaults/before-build');

const checkFileUpdate = require('../libs/check-file-change');
const removeTempBuild = require('../libs/remove-temp-build');
const removeTempProjectConfig = require('../libs/remove-temp-project-config');
const validateConfig = require('../libs/validate-config');
const validateConfigDist = require('../libs/validate-config-dist');
const getDirDevTmp = require('../libs/get-dir-dev-tmp');
const getDirDevCache = require('../libs/get-dir-dev-cache');
const getDirTemp = require('../libs/get-dir-tmp');

const __ = require('../utils/translate');
const sleep = require('../utils/sleep');
// const getPort = require('../utils/get-port')
const spinner = require('../utils/spinner');
// const readBuildConfigFile = require('../utils/read-build-config-file')
const getAppType = require('../utils/get-app-type');
const setEnvFromCommand = require('../utils/set-env-from-command');
const getChunkmapPath = require('../utils/get-chunkmap-path');
const initNodeEnv = require('../utils/init-node-env');
const getCwd = require('../utils/get-cwd');
const getPathnameDevServerStart = require('../utils/get-pathname-dev-server-start');
const getLogMsg = require('../libs/get-log-msg');
const log = require('../libs/log');
// const terminate = require('../utils/terminate')

const kootWebpackBuildVendorDll = require('koot-webpack/build-vendor-dll');

program
    .version(require('../package').version, '-v, --version')
    .usage('[options]')
    .option('-c, --client', 'Set STAGE to CLIENT')
    .option('-s, --server', 'Set STAGE to SERVER')
    .option('-g, --global', 'Connect to global PM2')
    .option('--stage <stage>', 'Set STAGE')
    .option(
        '--dest <destination-path>',
        'Set destination directory (for temporary files)'
    )
    .option('--config <config-file-path>', 'Set config file')
    .option('--type <project-type>', 'Set project type')
    .option('--port <port>', 'Set server port')
    .option('--no-open', "Don't open browser automatically")
    .option('--no-dll', "Don't use Webpack's DLL plugin")
    .option('--koot-test', 'Koot test mode')
    .parse(process.argv);

/**
 * 进入开发环境
 * ---
 * **同构 (isomorphic)**
 * 1. 启动 PM2 进程: `webpack-dev-server` (STAGE: client)
 * 2. 启动 PM2 进程: `webpack` (watch mode) (STAGE: server)
 * 3. 启动 PM2 进程: `[打包结果]/server/index.js`
 * 4. 启动 PM2 进程: `ReactApp/server/index-dev.js`
 * ---
 * **单页面应用 (SPA)**
 * - 强制设置 STAGE 为 client，并启动 webpack-dev-server
 *
 */
const run = async () => {
    process.env.WEBPACK_BUILD_ENV = 'dev';

    // 清除所有临时配置文件
    await removeTempProjectConfig();
    // 清理临时目录
    await before(program);

    // 清空 log
    process.stdout.write('\x1B[2J\x1B[0f');

    const {
        client,
        server,
        stage: _stage,
        dest,
        config,
        type,
        global = false,
        open = true,
        port,
        dll = true,
        kootTest = false
    } = program;

    initNodeEnv();
    setEnvFromCommand({
        config,
        type,
        port
    });

    let stage = (() => {
        if (_stage) return _stage;
        if (client) return 'client';
        if (server) return 'server';

        // false - 同构项目的完整开发环境
        return false;
    })();

    /** @type {String} build 命令的附加参数 */
    const buildCmdArgs =
        '--env dev' +
        (typeof dest === 'string' ? ` --dest ${dest}` : '') +
        (typeof config === 'string' ? ` --config ${config}` : '') +
        (typeof type === 'string' ? ` --type ${type}` : '') +
        (kootTest ? ` --koot-test` : '') +
        ' --koot-dev';

    // ========================================================================
    //
    // 准备项目配置和相关变量
    //
    // ========================================================================

    // 确保关键目录存在
    const cwd = getCwd();
    const dirDevTemp = getDirDevTmp(cwd);
    await fs.ensureDir(dirDevTemp);
    await fs.emptyDir(dirDevTemp);
    const dirCache = getDirDevCache();
    await fs.ensureDir(dirCache);
    await fs.emptyDir(dirCache);

    // 验证、读取项目配置信息
    const kootConfig = await validateConfig();

    // 如果在命令中设置了 dest，强制修改配置中的 dist
    if (dest) kootConfig.dist = validateConfigDist(dest);

    const {
        dist,
        // port: configPort,
        devPort,
        [keyFileProjectConfigTempFull]: fileProjectConfigTempFull,
        [keyFileProjectConfigTempPortionServer]: fileProjectConfigTempPortionServer,
        [keyFileProjectConfigTempPortionClient]: fileProjectConfigTempPortionClient
    } = kootConfig;
    const [devMemoryAllocationClient, devMemoryAllocationServer] = (() => {
        const { devMemoryAllocation } = kootConfig;
        if (!devMemoryAllocation) return [undefined, undefined];
        if (typeof devMemoryAllocation === 'object') {
            return [devMemoryAllocation.client, devMemoryAllocation.server];
        }
        if (isNaN(devMemoryAllocation)) return [undefined, undefined];
        return [parseInt(devMemoryAllocation), parseInt(devMemoryAllocation)];
    })();
    const appType = await getAppType();
    const packageInfo = await fs.readJson(path.resolve(cwd, 'package.json'));
    const { name } = packageInfo;

    // 清理目标目录
    await fs.ensureDir(dist);
    await fs.emptyDir(dist);
    await fs.ensureDir(path.resolve(dist, 'public'));
    await fs.ensureDir(path.resolve(dist, 'server'));

    /** @type {Array} 正在运行的进程/服务列表 */
    const processes = [];

    /** @type {Boolean} 全局等待提示 */
    let waitingSpinner = false;

    // 清理遗留的临时文件
    await removeTempBuild(dist);

    // 如果有临时项目配置文件，更改环境变量
    if (fileProjectConfigTempFull)
        process.env.KOOT_PROJECT_CONFIG_FULL_PATHNAME = fileProjectConfigTempFull;
    if (fileProjectConfigTempPortionServer)
        process.env.KOOT_PROJECT_CONFIG_PORTION_SERVER_PATHNAME = fileProjectConfigTempPortionServer;
    if (fileProjectConfigTempPortionClient)
        process.env.KOOT_PROJECT_CONFIG_PORTION_CLIENT_PATHNAME = fileProjectConfigTempPortionClient;

    // 如果为 SPA，强制设置 STAGE
    if (process.env.WEBPACK_BUILD_TYPE === 'spa') {
        process.env.WEBPACK_BUILD_STAGE = 'client';
        stage = 'client';
    }

    // 如果配置中存在 port，修改环境变量
    // if (typeof port === 'undefined' && typeof configPort !== 'undefined')
    //     process.env.SERVER_PORT = getPort(configPort, 'dev')
    process.env.SERVER_PORT = devPort;

    // 设置其他环境变量
    process.env.KOOT_DEV_START_TIME = Date.now();

    // 等待一段时间，确保某些硬盘操作的完成
    await sleep(1000);

    // ========================================================================
    //
    // 进程关闭行为
    //
    // ========================================================================
    const removeAllExitListeners = () => {
        process.removeListener('exit', exitHandler);
        process.removeListener('SIGINT', exitHandler);
        process.removeListener('SIGUSR1', exitHandler);
        process.removeListener('SIGUSR2', exitHandler);
        process.removeListener('uncaughtException', exitHandler);
    };
    const exitHandler = async (options = {}) => {
        let { silent = false, error = false } = options;

        if (error) silent = true;

        await removeTempProjectConfig();
        await removeTempBuild(dist);
        await fs.emptyDir(getDirDevTmp(cwd));
        // 清理临时目录
        await fs.remove(getDirTemp());

        if (Array.isArray(processes) && processes.length) {
            if (waitingSpinner) waitingSpinner.stop();
            await sleep(300);
            // 清屏
            if (!silent) process.stdout.write('\x1B[2J\x1B[0f');
            if (!silent)
                console.log(
                    '\n\n\n' +
                        chalk.redBright(
                            '!! Please wait for killing processes !!'
                        ) +
                        '\n\n'
                );
            for (let process of processes) {
                await new Promise((resolve, reject) => {
                    // console.log(process)
                    pm2.delete(process.name, (err, proc) => {
                        // console.log('err', err)
                        // console.log('proc', proc)
                        if (
                            Array.isArray(proc) &&
                            proc.every(p => p.status === 'stopped')
                        )
                            return resolve(proc);
                        if (err) return reject(err);
                        reject('stop failed');
                    });
                });
            }
            pm2.disconnect();
            await sleep(300);
            // w.stop()
            try {
                // console.log(process.pid)
                removeAllExitListeners();
                if (!error)
                    console.log(
                        '\n\n\n' +
                            chalk.cyanBright('Press CTRL+C again to exit.') +
                            '\n\n'
                    );
                // process.kill(process.pid)
                process.exit(1);
            } catch (e) {
                // console.log(e)
            }
        } else {
            removeAllExitListeners();
            // 清屏
            // process.stdout.write('\x1B[2J\x1B[0f')
            if (!error) console.log('Press CTRL+C again to exit.');

            // 发送信息
            if (process.send) {
                process.send('Koot dev mode exit successfully');
            }

            // 退出
            process.exit(1);
        }
    };
    // 在脚本进程关闭/结束时，同时关闭打开的 PM2 进程
    process.stdin.resume();
    // do something when app is closing
    process.on('exit', exitHandler);
    // catches ctrl+c event
    process.on('SIGINT', exitHandler);
    // catches "kill pid" (for example: nodemon restart)
    process.on('SIGUSR1', exitHandler);
    process.on('SIGUSR2', exitHandler);
    // catches uncaught exceptions
    process.on('uncaughtException', exitHandler);

    // ========================================================================
    //
    // 如果开启了 Webpack DLL 插件，此时执行 DLL 打包
    //
    // ========================================================================
    if (dll && process.env.WEBPACK_BUILD_STAGE !== 'server') {
        const msg = getLogMsg(false, 'dev', __('dev.build_dll'));
        const waiting = spinner(msg + '...');

        // DLL 打包
        if (stage) {
            process.env.WEBPACK_BUILD_STAGE = stage;
            await kootWebpackBuildVendorDll(kootConfig);
        } else {
            const stageCurrent = process.env.WEBPACK_BUILD_STAGE;

            process.env.WEBPACK_BUILD_STAGE = 'client';
            await kootWebpackBuildVendorDll(kootConfig);
            await sleep(500);
            process.env.WEBPACK_BUILD_STAGE = 'server';
            await kootWebpackBuildVendorDll(kootConfig);

            process.env.WEBPACK_BUILD_STAGE = stageCurrent;
        }

        await sleep(500);
        // console.log('result', result)
        // console.log(111)
        // return

        waiting.stop();
        spinner(msg).succeed();
    }

    // ========================================================================
    //
    // 如果设置了 stage，仅运行该 stage
    //
    // ========================================================================
    if (stage) {
        const cmd = `koot-build --stage ${stage} ${buildCmdArgs}`;
        const child = npmRunScript(cmd, {});
        child.once('error', error => {
            console.trace(error);
            process.exit(1);
        });
        child.once('exit', async (/*exitCode*/) => {
            // console.trace('exit in', exitCode)
            // process.exit(exitCode)
        });

        // SPA 开发环境
        if (process.env.WEBPACK_BUILD_TYPE === 'spa') {
            // 等待 filenameBuilding 文件删除
            let flagCreated = false;
            const fileFlagBuilding = path.resolve(dist, filenameBuilding);
            await new Promise(resolve => {
                const wait = () =>
                    setTimeout(() => {
                        if (!flagCreated) {
                            flagCreated = fs.existsSync(fileFlagBuilding);
                            return wait();
                        }
                        if (!fs.existsSync(fileFlagBuilding)) return resolve();
                        wait();
                    }, 1000);
                wait();
            });

            // console.log(' ')

            await new Promise(resolve => {
                setTimeout(() => {
                    log('success', 'dev', __('dev.spa_success'));
                    console.log(
                        '           @ ' +
                            chalk.green(
                                `http://localhost:${process.env.SERVER_PORT}/`
                            )
                    );
                    console.log(' ');
                    console.log('------------------------------');
                    console.log(' ');
                    resolve();
                }, 500);
            });

            if (open) openBrowserPage();
        }

        return;
    }

    // ========================================================================
    //
    // 没有设置 STAGE，表示同构项目的完整开发环境，开启多个进程
    //
    // ========================================================================
    // spinner(
    //     chalk.yellowBright('[koot/build] ')
    //     + __('build.build_start', {
    //         type: chalk.cyanBright(appType),
    //         stage: chalk.green('client'),
    //         env: chalk.green('dev'),
    //     })
    // )

    const pathChunkmap = getChunkmapPath(dist);
    const pathServerJS = path.resolve(dist, 'server/index.js');
    const pathServerStartFlag = getPathnameDevServerStart();

    // 根据 stage 开启 PM2 进程
    const start = stage =>
        new Promise(async (resolve, reject) => {
            // console.log(`starting ${stage}`)

            const pathLogOut = path.resolve(getDirDevTmp(cwd), `${stage}.log`);
            const pathLogErr = path.resolve(
                getDirDevTmp(cwd),
                `${stage}-error.log`
            );
            if (fs.existsSync(pathLogOut)) await fs.remove(pathLogOut);
            if (fs.existsSync(pathLogErr)) await fs.remove(pathLogErr);
            await fs.ensureFile(pathLogOut);
            await fs.ensureFile(pathLogErr);

            const config = {
                name: `${stage}-${name}`,
                script: path.resolve(__dirname, './build.js'),
                args: `--stage ${stage} ${buildCmdArgs}`,
                cwd: cwd,
                output: pathLogOut,
                error: pathLogErr,
                autorestart: false
            };

            switch (stage) {
                case 'client': {
                    if (devMemoryAllocationClient)
                        config.node_args = `--max-old-space-size=${devMemoryAllocationClient}`;
                    break;
                }
                case 'server': {
                    if (devMemoryAllocationServer)
                        config.node_args = `--max-old-space-size=${devMemoryAllocationServer}`;
                    break;
                }
                case 'run': {
                    Object.assign(config, {
                        script: pathServerJS,
                        watch: path.dirname(pathServerJS),
                        ignore_watch: [
                            '.server-start',
                            'node_modules',
                            config.output,
                            config.error
                        ],
                        watch_options: {
                            cwd: path.dirname(pathServerJS)
                            // usePolling: true
                        }
                        // autorestart: true,
                    });
                    // console.log(config);
                    delete config.args;
                    // console.log(config)
                    // await fs.writeJson(
                    //     path.resolve(__dirname, '../1.json'),
                    //     config,
                    //     {
                    //         spaces: 4
                    //     }
                    // )
                    break;
                }
                case 'main': {
                    Object.assign(config, {
                        script: path.resolve(
                            __dirname,
                            '../ReactApp/server/index-dev.js'
                        )
                    });
                    delete config.args;
                    break;
                }
                default: {
                }
            }

            // console.log(config)
            // processes.push(config.name)
            pm2.start(config, (err, proc) => {
                // console.log(err)
                if (err) return reject(err);
                processes.push({
                    ...proc,
                    name: config.name
                });
                // console.log(JSON.stringify(proc))
                // fs.writeJsonSync(
                //     path.resolve(__dirname, '../2.json'),
                //     proc,
                //     {
                //         spaces: 4
                //     }
                // )
                resolve(proc);
            });
        });

    // 启动过程结束
    const complete = () => {
        npmRunScript(`pm2 logs`);
        if (open) return opn(`http://localhost:${process.env.SERVER_PORT}/`);
    };

    // 遇到错误
    const encounterError = e => {
        const error = e instanceof Error ? e : new Error(e);
        exitHandler({ error: true });
        throw error;
    };

    // 连接 PM2
    // console.log('noDaemon', !global)
    try {
        pm2.connect(!global, async err => {
            if (err) {
                // console.error(err)
                process.exit(2);
            }

            console.log(
                `  ` +
                    chalk.yellowBright('[koot/build] ') +
                    __('build.build_start', {
                        type: chalk.cyanBright(__(`appType.${appType}`)),
                        stage: chalk.green('client'),
                        env: chalk.green('dev')
                    })
            );

            // 清空 chunkmap 文件
            await fs.ensureFile(pathChunkmap);
            await fs.writeFile(pathChunkmap, contentWaiting);

            // 清空 server 打包结果文件
            await fs.ensureFile(pathServerJS);
            await fs.writeFile(pathServerJS, contentWaiting);

            // 清空服务器启动成功标识文件
            await fs.ensureFile(pathServerStartFlag);
            await fs.writeFile(pathServerStartFlag, contentWaiting);

            // 启动 client webpack-dev-server
            /*const processClient = */ await start('client');

            // 监视 chunkmap 文件，如果修改，进入下一步
            // await Promise.race([
            await checkFileUpdate(pathChunkmap, contentWaiting);
            //     checkFileUpdate(path.resolve(getDirDevTmp(cwd), 'client-error.log'), '')
            //         .then(encounterError)
            // ])
            // waitingSpinner.succeed()
            console.log(
                chalk.green('√ ') +
                    chalk.yellowBright('[koot/build] ') +
                    __('build.build_complete', {
                        type: chalk.cyanBright(__(`appType.${appType}`)),
                        stage: chalk.green('client'),
                        env: chalk.green('dev')
                    })
            );
            // console.log(processClient[0].process, processClient[0].pid)
            // console.log(
            //     `  [${}]`
            // )

            // 启动 server webpack
            // waitingSpinner = spinner(
            //     chalk.yellowBright('[koot/build] ')
            //     + __('build.build_start', {
            //         type: chalk.cyanBright(appType),
            //         stage: chalk.green('server'),
            //         env: chalk.green('dev'),
            //     })
            // )
            console.log(
                `  ` +
                    chalk.yellowBright('[koot/build] ') +
                    __('build.build_start', {
                        type: chalk.cyanBright(__(`appType.${appType}`)),
                        stage: chalk.green('server'),
                        env: chalk.green('dev')
                    })
            );
            await start('server');

            // 监视 server.js 文件，如果修改，进入下一步
            await checkFileUpdate(pathServerJS, contentWaiting);
            // waitingSpinner.succeed()

            // 执行
            // waitingSpinner = spinner(
            //     chalk.yellowBright('[koot/build] ')
            //     + 'waiting...'
            // )

            await sleep(500);
            console.log(
                chalk.green('√ ') +
                    chalk.yellowBright('[koot/build] ') +
                    __('build.build_complete', {
                        type: chalk.cyanBright(__(`appType.${appType}`)),
                        stage: chalk.green('server'),
                        env: chalk.green('dev')
                    })
            );

            // 启动服务器
            await start('run');

            // 监视服务器启动标识文件，如果修改，进入下一步
            const errServerRun = await checkFileUpdate(
                pathServerStartFlag,
                contentWaiting
            );

            // 移除临时文件
            await fs.remove(
                path.resolve(
                    getDirDevTmp(cwd),
                    filenameWebpackDevServerPortTemp
                )
            );

            // waitingSpinner.stop()
            // waitingSpinner = undefined

            /** @type {Object} 服务器相关信息 */
            let infosServer;
            try {
                infosServer = JSON.parse(errServerRun);
            } catch (e) {}

            if (
                typeof infosServer !== 'object' &&
                errServerRun !== ' ' &&
                errServerRun
            ) {
                // 出错
                console.log(' ');
                console.log(chalk.redBright(errServerRun));
                console.log(' ');
                return await exitHandler({
                    silent: true
                });
            }

            await start('main');
            await checkFileUpdate(pathServerStartFlag, contentWaiting);

            return complete();
        });
    } catch (e) {
        encounterError(e);
    }
};

const openBrowserPage = () => {
    return opn(`http://localhost:${process.env.SERVER_PORT}/`);
};

run().catch(err => {
    console.error(err);
});
