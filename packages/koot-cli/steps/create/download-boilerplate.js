const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const download = require('download-git-repo');
const chalk = require('chalk');

const _ = require('../../lib/translate');
const spinner = require('../../lib/spinner');
const getConfigFile = require('../../lib/get-config-file');

const repo = 'github:cmux/koot';

/**
 * 下载模板
 * @async
 * @param {Object} project 项目信息
 * @param {String} dest 下载目标目录
 */
module.exports = async (project, dest) => {
    const isNext = [...process.argv].includes('next');

    /** @type {String} 下载临时目录 */
    const msg =
        chalk.whiteBright(_('downloading_boilerplate')) +
        (isNext ? ` (next)` : '');
    const downloadTo = path.resolve(os.tmpdir(), `sp-${Date.now()}`);
    const waitingDownloading = spinner(msg + '...');
    await new Promise((resolve, reject) => {
        download(repo + (isNext ? `#next` : ''), downloadTo, err => {
            if (err) return reject(err);
            resolve();
        });
    });
    waitingDownloading.stop();
    spinner(msg).finish();

    // 更新配置文件内容，并复制到目标目录中
    /** @type {String} 模板所在目录 */
    const tmp = path.resolve(downloadTo, `packages/koot-boilerplate`);
    const waitingCopying = spinner(
        chalk.whiteBright(_('copying_boilerplate')) + '...'
    );
    const pathPackage = path.resolve(tmp, 'package.json');
    const p = await fs.readJson(pathPackage);
    p.version = '1.0.0';
    if (typeof project.name === 'string') {
        p.name = project.name;
    }
    if (typeof project.description === 'string' && project.description !== '') {
        p.description = project.description;
    } else {
        delete p.description;
    }
    if (typeof project.author === 'object') {
        p.author = project.author;
    } else {
        delete p.author;
    }
    if (project.dist) {
        if (
            !path.isAbsolute(project.dist) &&
            !/^\.(\/|\\)/.test(project.dist.substr(0, 2))
        ) {
            project.dist = './' + project.dist;
        }
        const pathBuildConfig = await getConfigFile(tmp);
        const buildConfig = await fs.readFile(pathBuildConfig, 'utf-8');
        // const { name, dist } = require(pathBuildConfig);
        const { name, dist } = {
            name: 'Koot.js App',
            dist: './dist'
        };
        const regexName = new RegExp(`([ ]*)name:[ ]*['"]${name}['"]`, 'gm');
        const regexDist = new RegExp(`([ ]*)dist:[ ]*['"]${dist}['"]`, 'gm');
        await fs.writeFile(
            pathBuildConfig,
            buildConfig
                .replace(regexName, `$1name: "${project.name}"`)
                .replace(regexDist, `$1dist: "${project.dist}"`),
            'utf-8'
        );

        const pathBuildSpaConfig = path.resolve(tmp, 'koot.build.spa.js');
        if (fs.existsSync(pathBuildSpaConfig)) {
            const buildSpaConfig = await fs.readFile(
                pathBuildSpaConfig,
                'utf-8'
            );
            await fs.writeFile(
                pathBuildSpaConfig,
                buildSpaConfig.replace(
                    regexDist,
                    `dist: "${project.dist}-spa"`
                ),
                'utf-8'
            );
        }
    }
    await fs.remove(path.resolve(tmp, 'package-lock.json'));
    await fs.writeJson(pathPackage, p, {
        spaces: 4
    });
    await fs.move(tmp, dest, { overwrite: true });
    waitingCopying.stop();
    spinner(chalk.whiteBright(_('copying_boilerplate'))).finish();
};
