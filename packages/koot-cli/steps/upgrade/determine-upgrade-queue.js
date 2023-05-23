import fs from 'fs-extra';
import path from 'path';
import semver from 'semver';
import packageJson from 'package-json';
import chalk from 'chalk';

import { lowestSuperProjectVersion } from '../../lib/vars.js';
import spinner from '../../lib/spinner.js';
import _ from '../../lib/translate.js';

/**
 * 判断当前项目升级到最新版本所需的升级队列
 * @param {String} dir 项目目录
 * @returns {Array}
 */
const determineUpgradeQueue = async (dir = process.cwd()) => {
    const pathnamePackageJson = path.resolve(dir, 'package.json');
    const waiting = spinner(
        chalk.whiteBright(_('upgrade_determining')) + '...'
    );

    const throwError = (msg) => {
        waiting.stop();
        throw new Error(msg);
    };

    if (!fs.existsSync(pathnamePackageJson))
        throwError('package.json not exist');

    const p = await fs.readJson(pathnamePackageJson);

    if (
        typeof p.dependencies !== 'object' ||
        !(p.dependencies['super-project'] || p.dependencies.koot)
    )
        throwError('not koot.js project');

    const queue = [];
    let versionKootLocal;

    // 如果项目使用 super-project
    if (p.dependencies['super-project']) {
        const versionSuper = p.dependencies['super-project'];

        if (!semver.valid(versionSuper))
            throwError('super-project version invalid');

        const version = semver.valid(semver.coerce(versionSuper));
        if (semver.satisfies(version, `<${lowestSuperProjectVersion}`))
            throwError('super-project version too low');

        if (semver.satisfies(version, `<3.0.8`)) {
            queue.push(['super-3.0.7', '0.1']);
            versionKootLocal = semver.valid(semver.coerce('0.1'));
        }
    }

    // 确定项目中使用的 koot 的版本号
    if (p.dependencies.koot)
        versionKootLocal = semver.valid(semver.coerce(p.dependencies.koot));

    if (semver.lt(versionKootLocal, `0.2.0`)) {
        queue.push(['0.1', '0.2']);
        versionKootLocal = '0.2.0';
    }

    if (semver.lt(versionKootLocal, `0.7.0`)) {
        queue.push(['0.6', '0.7']);
        versionKootLocal = '0.7.0';
    }

    if (semver.lt(versionKootLocal, `0.8.0`)) {
        queue.push(['0.7', '0.8']);
        versionKootLocal = '0.8.0';
    }

    if (semver.lt(versionKootLocal, `0.9.0`)) {
        queue.push(['0.8', '0.9']);
        versionKootLocal = '0.9.0';
    }

    const latestPackageJson = await packageJson('koot');
    const versionKootLastest = semver.valid(
        semver.coerce(latestPackageJson.version)
    );
    // const latestPackageJson = {
    //     version: '0.7.0-alpha.7'
    // }
    // console.log({
    //     local: versionKootLocal,
    //     latest: versionKootLastest
    // })
    if (semver.lt(versionKootLocal, versionKootLastest))
        queue.push(latestPackageJson.version);

    waiting.stop();
    // console.log(
    //     'latestPackageJson',
    //     latestPackageJson,
    //     semver.valid(semver.coerce(latestPackageJson.version)),
    //     semver.lt(versionKootLocal, semver.valid(semver.coerce(latestPackageJson.version)))
    // )
    return queue;
};

export default determineUpgradeQueue;
