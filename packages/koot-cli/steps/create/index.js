/* eslint-disable no-console */

import path from 'node:path';
import fs from 'fs-extra';
import chalk from 'chalk';
import isUrl from 'is-url';

import ensureLocales from '../../lib/ensure-locales.js';
import _ from '../../lib/translate.js';
import checkIsCMNetwork from '../../lib/check-is-cm-network.js';
import spinner from '../../lib/spinner.js';
import { welcome as logWelcome } from '../../lib/log.js';

import inquiry from './inquiry-project.js';
import download from './download-boilerplate.js';
import install from './install-deps.js';
import modifyPackageJson from './modify-package-json.js';
import modifyBoilerplate from './modify-boilerplate.js';

// ============================================================================

const commands = {
    dev: {
        yarn: 'yarn dev',
        npm: 'npm run dev',
    },
};

// ============================================================================

/**
 * 创建 Koot.js 项目
 * @async
 * @param {Object} [options]
 * @param {Boolean} [options.showWelcome=true] 显示欢迎信息
 */
const create = async (options = {}) => {
    const waiting = spinner('');

    /** 目标目录路径 */
    let dest;

    /** 目标目录是否已经存在 */
    let destExists = false;

    /** 检查命令中是否包含 `next` 关键字 */
    const isNext = [...process.argv].includes('next');

    try {
        const { showWelcome = true } = options;

        await ensureLocales();

        /** 当前是否在 CM 内网 */
        const isCMNetwork = await checkIsCMNetwork();

        waiting.stop();

        if (showWelcome) {
            await logWelcome();
        }

        spinner(_('about_to_create_new_project')).info();
        if (isNext) {
            spinner(_('create_new_project_using_next_boilerplate')).info();
        }
        spinner(_('required_info')).info();
        console.log('');

        const app = await inquiry({ isCMNetwork });

        // const r = await require('./get-project-folder')(app);
        dest = app.dest;
        destExists = app.destExists;

        // return console.warn(app);

        await download(app.dest, app.boilerplate);
        await modifyPackageJson(app).catch((e) => console.trace(e));
        await install(app);
        await modifyBoilerplate(app).catch((e) => console.trace(e));

        console.log('');

        console.log(chalk.cyanBright(_('whats_next')));
        const rel = path.relative(process.cwd(), dest);
        if (app.destRelative !== '.' && rel) logNext('goto_dir', `cd ${rel}`);
        // logNext('install_dependencies', `npm i`);
        if (
            app.boilerplate === 'serverless' ||
            app.serverMode === 'serverless'
        ) {
            logNext(
                'visit_for_steps',
                `https://github.com/cmux/koot-serverless/tree/master/packages/koot-serverless`
            );
        } else {
            logNext('run_dev', commands.dev[app.packageManager]);
            logNext('visit');
        }

        console.log('');
    } catch (e) {
        if (dest && !destExists) await fs.remove(dest);
        waiting.fail(e);
        throw e;
    }
};
export default create;

let nextStep = 1;
const logNext = (step, command) => {
    console.log(chalk.cyanBright(`${nextStep}. `) + _(`step_${step}`));
    if (isUrl(command)) console.log(`   ` + chalk.underline(`${command}`));
    else if (command) console.log(`   ` + chalk.white(`> ${command}`));
    nextStep++;
};

// const run = async (options = {}) => {};

// ============================================================================
