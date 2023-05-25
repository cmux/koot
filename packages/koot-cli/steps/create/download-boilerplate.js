/**
 * @typedef {Object} Download
 * @property {string} [github] GitHub 仓库名
 * @property {string} [branch=master] 如果是 Git，分支名
 * @property {string} [subdir] 模板所在的子目录
 * @property {Download} [next] `next` 摸板，扩展基础对象
 */

import path from 'node:path';
import fs from 'fs-extra';
import os from 'os';
import chalk from 'chalk';
import { glob } from 'glob';
import { download } from '@guoyunhe/downloader';

import '../../types/index.js';

import _ from '../../lib/translate.js';
import spinner from '../../lib/spinner.js';
// const getConfigFile = require('../../lib/get-config-file');

/**
 * 下载模板
 * @async
 * @param {string} dest 下载目标目录
 * @param {BoilerplateType} type 模板类型
 * @returns {Promise<void>}
 */
const downloadBoilerplate = async (dest, type) => {
    const isNext = [...process.argv].includes('next');
    const msg =
        chalk.whiteBright(_('downloading_boilerplate')) +
        (isNext ? ` (next)` : '');
    const waitingDownloading = spinner(msg + '...');

    // const download = downloads[type] || downloads.base;
    if (isNext) Object.assign(download, download.next || {});

    // ========================================================================
    //
    // 下载
    //
    // ========================================================================

    /** @type {String} 下载临时目录 */
    const downloadTo = path.resolve(os.tmpdir(), `koot-new-${Date.now()}`);
    const downloadUrl = `https://github.com/cmux/koot/archive/refs/heads/${
        isNext ? 'next' : 'master'
    }.zip`;

    try {
        await download(downloadUrl, downloadTo, { extract: true, strip: 1 });
        waitingDownloading.stop();
        spinner(msg).finish();
    } catch (e) {
        // eslint-disable-next-line no-console
        console.trace(e);
        await fs.remove(downloadTo);
        throw e;
    }

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
    const files = await glob('**/*', {
        cwd: dirBoilerplate,
        dot: true,
    });
    for (const from of files) {
        // const relativePath = path.relative(dirBoilerplate, from);
        const to = path.resolve(dest, from);
        await fs.copy(path.resolve(dirBoilerplate, from), to, {
            overwrite: true,
        });
    }

    // 删除下载的临时文件
    if (fs.existsSync(downloadTo)) await fs.remove(downloadTo);

    // 标记完成
    waitingCopying.stop();
    spinner(msgCopying).finish();
};

export default downloadBoilerplate;
