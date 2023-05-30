/* eslint-disable no-console */
import fs from 'fs-extra';
import isPortReachable from 'is-port-reachable';
import inquirer from 'inquirer';
// const osLocale = require('os-locale')

import getPathnameDevServerStart from '../utils/get-pathname-dev-server-start.js';
import getFreePort from './get-free-port.js';

/**
 * @async
 * @returns {Number|Boolean} 如果最终没有结果，返回 false，否则返回可用的端口数
 */
const doValidatePort = async () => {
    // [开发环境] 如果 flag 文件中写有端口，直接使用该端口
    if (__DEV__) {
        let infos;
        try {
            infos = await fs.readJson(getPathnameDevServerStart());
        } catch (e) {}
        if (typeof infos === 'object') return infos.port;
    }

    // const locale = osLocale.sync()
    // console.log('locale', locale)

    // 如果环境变量中不存在 SERVER_PORT 同时全局变量 __SERVER_PORT__ 存在可用值，赋值环境变量
    // __SERVER_PORT__ 为 webpack 打包时使用 definePlugin 替换入的全局变量值
    if (
        typeof process.env.SERVER_PORT === 'undefined' &&
        typeof __SERVER_PORT__ !== 'undefined'
    )
        process.env.SERVER_PORT = __SERVER_PORT__;

    /** @type {Boolean} 环境变量 SERVER_PORT 的端口号是否可用 */
    const isPortInEnvFree = await isPortFree(process.env.SERVER_PORT);

    // 如果可用，返回该端口号，结束
    if (isPortInEnvFree) return process.env.SERVER_PORT;

    // 如果不可用，输出日志
    logPortTaken(process.env.SERVER_PORT);

    // [开发环境] 修改 flag 文件，标记端口被占用，并结束
    if (__DEV__) {
        // 修改 flag 文件
        await fs.writeFile(
            getPathnameDevServerStart(),
            `port ${process.env.SERVER_PORT} has been taken.`,
            'utf-8'
        );
        // 跳出
        return false;
    }

    /** @type {Boolean} 端口是否被占用 */
    let isPortTaken = true;
    /** @type {Number} 端口结果 */
    let port;

    while (isPortTaken) {
        const askForPort = await inquirer.prompt([
            {
                type: 'input',
                name: 'port',
                message:
                    'Please input a new port number (leave empty for cancel)',
                validate: (input) => {
                    if (!input) return true;
                    if (isNaN(input)) return 'Must be a number or null';
                    return true;
                },
            },
        ]);
        if (!askForPort.port) {
            isPortTaken = false;
            port = undefined;
        } else {
            port = await isPortFree(askForPort.port);
            isPortTaken = !port ? true : false;
            if (isPortTaken) logPortTaken(askForPort.port);
        }
    }

    if (port) return port;
    return false;
};

/**
 * 验证目标端口是否可用
 * @async
 * @param {Number|String} port
 * @returns {Number|Boolean} 如果端口可用，返回该端口；如果不可用，返回 false
 */
const isPortFree = async (port) => {
    const isPortOpen = !(await isPortReachable(port));
    if (isPortOpen) return port;
    return false;
};

/**
 * log: 目标端口被占用
 * @param {Number|String} port
 */
const logPortTaken = (port) => {
    console.log(
        `\x1b[31m×\x1b[0m ` +
            `\x1b[93m[koot/server]\x1b[0m port \x1b[32m${port}\x1b[0m has been taken.`
    );
};

/**
 * 验证服务器启动端口
 *
 * 依次检查以下变量/常量，当发现可用值时进入下一步
 * - `__SERVER_PORT__`
 * - `process.env.SERVER_PORT`
 *
 * 检查设定好的端口号是否可用
 * - 如果可用，直接返回结果
 * - 如果不可用，提示下一步操作
 * - 如果不可用同时之后的操作取消，返回 false
 *
 * _生产环境_
 * 设定环境变量
 * - `SERVER_PORT` -> 指定的端口
 *
 * _开发环境_
 * 设定环境变量
 * - `SERVER_PORT` -> 随机端口
 * - `SERVER_PORT_DEV_MAIN` -> 指定的端口
 *
 * @async
 * @returns {Number|Boolean} 如果最终没有结果，返回 false，否则返回可用的端口数
 */
const validatePort = async () => {
    const port = await doValidatePort();
    if (!port) return false;
    if (__DEV__) {
        // 开发环境：在随机端口启用服务器
        const portFree = await getFreePort(port);
        process.env.SERVER_PORT = portFree;
        process.env.SERVER_PORT_DEV_MAIN = port;
    }
    return port;
};

export default validatePort;
