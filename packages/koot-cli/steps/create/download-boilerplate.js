require('../../types');

/**
 * @typedef {Object} Download
 * @property {string} [github] GitHub 仓库名
 * @property {string} [branch=master] 如果是 Git，分支名
 * @property {string} [subdir] 模板所在的子目录
 * @property {Download} [next] `next` 摸板，扩展基础对象
 */

const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const downloadGitRepo = require('download-git-repo');
const chalk = require('chalk');
const glob = require('glob-promise');

const _ = require('../../lib/translate');
const spinner = require('../../lib/spinner');
// const getConfigFile = require('../../lib/get-config-file');

/** @type {Object.<string, Download>} */
const downloads = {
    base: {
        github: 'cmux/koot',
        subdir: 'packages/koot-boilerplate',
        next: {
            branch: 'next'
        }
    },
    serverless: {}
};

/**
 * 下载模板
 * @async
 * @param {string} dest 下载目标目录
 * @param {BoilerplateType} type 模板类型
 * @returns {Promise<void>}
 */
module.exports = async (dest, type) => {
    const isNext = [...process.argv].includes('next');
    const msg =
        chalk.whiteBright(_('downloading_boilerplate')) +
        (isNext ? ` (next)` : '');
    const waitingDownloading = spinner(msg + '...');

    const download = downloads[type];
    if (isNext) Object.assign(download, download.next || {});

    // ========================================================================
    //
    // 下载
    //
    // ========================================================================

    /** @type {String} 下载临时目录 */
    const downloadTo = path.resolve(os.tmpdir(), `koot-new-${Date.now()}`);

    await new Promise((resolve, reject) => {
        downloadGitRepo(
            download.github + (download.branch ? `#${download.branch}` : ''),
            downloadTo,
            err => {
                if (err) return reject(err);
                resolve();
            }
        );
    });

    waitingDownloading.stop();
    spinner(msg).finish();

    // ========================================================================
    //
    // 复制
    //
    // ========================================================================

    const msgCopying = chalk.whiteBright(_('copying_boilerplate'));
    const waitingCopying = spinner(msgCopying + '...');
    /** @type {String} 模板所在目录 */
    const dirBoilerplate = path.resolve(downloadTo, download.subdir || '.');

    const filesToRemove = ['package-lock.json', 'yarn.lock'];
    for (const file of filesToRemove) {
        await fs.remove(path.resolve(dirBoilerplate, file));
    }

    // 合并目录
    const files = await glob(path.resolve(dirBoilerplate, '**/*'), {
        dot: true
    });
    for (const from of files) {
        const relativePath = path.relative(dirBoilerplate, from);
        const to = path.resolve(dest, relativePath);
        await fs.copy(from, to, { overwrite: true });
    }

    // 删除下载的临时文件
    if (fs.existsSync(downloadTo)) await fs.remove(downloadTo);

    // 标记完成
    waitingCopying.stop();
    spinner(msgCopying).finish();

    // const pathPackage = path.resolve(tmp, 'package.json');
    // const p = await fs.readJson(pathPackage);
    // p.version = '1.0.0';
    // if (typeof project.name === 'string') {
    //     p.name = project.name;
    // }
    // if (typeof project.description === 'string' && project.description !== '') {
    //     p.description = project.description;
    // } else {
    //     delete p.description;
    // }
    // if (typeof project.author === 'object') {
    //     p.author = project.author;
    // } else {
    //     delete p.author;
    // }
    // if (false || project.dist) {
    //     if (
    //         !path.isAbsolute(project.dist) &&
    //         !/^\.(\/|\\)/.test(project.dist.substr(0, 2))
    //     ) {
    //         project.dist = './' + project.dist;
    //     }
    //     const pathBuildConfig = await getConfigFile(tmp);
    //     const buildConfig = await fs.readFile(pathBuildConfig, 'utf-8');
    //     // const { name, dist } = require(pathBuildConfig);
    //     const { name, dist } = {
    //         name: 'Koot.js App',
    //         dist: './dist'
    //     };
    //     const regexName = new RegExp(`([ ]*)name:[ ]*['"]${name}['"]`, 'gm');
    //     const regexDist = new RegExp(`([ ]*)dist:[ ]*['"]${dist}['"]`, 'gm');
    //     await fs.writeFile(
    //         pathBuildConfig,
    //         buildConfig
    //             .replace(regexName, `$1name: "${project.name}"`)
    //             .replace(regexDist, `$1dist: "${project.dist}"`),
    //         'utf-8'
    //     );

    //     const pathBuildSpaConfig = path.resolve(tmp, 'koot.build.spa.js');
    //     if (fs.existsSync(pathBuildSpaConfig)) {
    //         const buildSpaConfig = await fs.readFile(
    //             pathBuildSpaConfig,
    //             'utf-8'
    //         );
    //         await fs.writeFile(
    //             pathBuildSpaConfig,
    //             buildSpaConfig.replace(
    //                 regexDist,
    //                 `dist: "${project.dist}-spa"`
    //             ),
    //             'utf-8'
    //         );
    //     }
    // }

    // 写入新的 package.json
    // await fs.writeJson(pathPackage, p, {
    //     spaces: 4
    // });
};
