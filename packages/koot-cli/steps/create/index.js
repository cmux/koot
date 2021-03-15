const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const isUrl = require('is-url');

const vars = require('../../lib/vars');
const getLocales = require('../../lib/get-locales');
const _ = require('../../lib/translate');
const checkIsCMNetwork = require('../../lib/check-is-cm-network');
const spinner = require('../../lib/spinner');

const inquiry = require('./inquiry-project');
const download = require('./download-boilerplate');
const install = require('./install-deps');
const modifyPackageJson = require('./modify-package-json');
const modifyBoilerplate = require('./modify-boilerplate');

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
module.exports = async (options = {}) => {
    const waiting = spinner('');

    /** 目标目录路径 */
    let dest;

    /** 目标目录是否已经存在 */
    let destExists = false;

    try {
        const { showWelcome = true } = options;

        vars.locales = await getLocales();

        /** 当前是否在 CM 内网 */
        const isCMNetwork = await checkIsCMNetwork();

        waiting.stop();

        if (showWelcome) {
            // 根据是否在 CM 内网输出欢迎信息
            console.log('');
            if (isCMNetwork)
                console.log(chalk.cyanBright(_('welcomeCM')) + '\n');
            console.log(chalk.cyanBright(_('welcome')));
            console.log(_('required_info'));
            console.log('');
        }

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

let nextStep = 1;
const logNext = (step, command) => {
    console.log(chalk.cyanBright(`${nextStep}. `) + _(`step_${step}`));
    if (isUrl(command)) console.log(`   ` + chalk.underline(`${command}`));
    else if (command) console.log(`   ` + chalk.white(`> ${command}`));
    nextStep++;
};

// const run = async (options = {}) => {};

// ============================================================================
