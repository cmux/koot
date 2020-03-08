const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

const vars = require('../../lib/vars');
const getLocales = require('../../lib/get-locales');
const _ = require('../../lib/translate');

const modifyPackageJsonAddKootVersion = require('../../lib/modify-package-json/add-koot-version');

/**
 * 创建 Koot.js 项目
 * @async
 * @param {Object} [options]
 * @param {Boolean} [options.showWelcome=true] 显示欢迎信息
 */
module.exports = async (options = {}) => {
    /** 目标目录路径 */
    let dest;

    /** 目标目录是否已经存在 */
    let destExists = false;

    try {
        const { showWelcome = true } = options;

        vars.locales = await getLocales();

        // 检查是否在 CM 内网 - 尝试访问 oa.cmcm.com

        if (showWelcome) {
            // 根据是否在 CM 内网输出欢迎信息
            console.log('');
            console.log(chalk.cyanBright(_('welcome')));
            console.log(_('required_info'));
            console.log('');
        }

        const project = await require('./inquiry-project')();

        const r = await require('./get-project-folder')(project);
        dest = r.dest;
        destExists = r.destExists;

        await require('./download-boilerplate')(project, dest);
        await modifyPackageJsonAddKootVersion(dest);

        console.log('');
        // console.log(project)
        // console.log(process.cwd(), dest)
        // console.log(path.relative(process.cwd(), dest))

        console.log(chalk.cyanBright(_('whats_next')));
        logNext('goto_dir', `cd ${path.relative(process.cwd(), dest)}`);
        logNext('install_dependencies', `npm i`);
        logNext('run_dev', `npm run dev`);
        logNext('visit');

        console.log('');
    } catch (e) {
        if (dest && !destExists) await fs.remove(dest);
        throw e;
    }
};

let nextStep = 1;
const logNext = (step, command) => {
    console.log(chalk.cyanBright(`${nextStep}. `) + _(`step_${step}`));
    if (command) console.log(`   ` + chalk.gray(`> ${command}`));
    nextStep++;
};

const run = async (options = {}) => {};

// ============================================================================
