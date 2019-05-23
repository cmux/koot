const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');

const vars = require('../../lib/vars');
const getLocales = require('../../lib/get-locales');
const spinner = require('../../lib/spinner');
const _ = require('../../lib/translate');
const modifyPackageJsonAddKootVersion = require('../../lib/modify-package-json/add-koot-version');

/**
 * 升级 Koot.js 项目
 * @async
 * @param {Object} options
 * @param {String} [options.cwd=process.cwd()] 运行目录
 * @param {Boolean} [options.needConfirm=false] 仅返回 ASCII 文件
 * @param {Boolean} [options.showWelcome=true] 显示欢迎信息
 */
module.exports = async (options = {}) => {
    vars.locales = await getLocales();

    const {
        cwd = process.cwd(),
        needConfirm = false,
        showWelcome = true
    } = options;

    if (showWelcome) {
        console.log('');
        console.log(chalk.cyanBright(_('welcome_upgrade')));
    }

    if (needConfirm) {
        const confirm = await inquirer.prompt({
            type: 'list',
            name: 'value',
            message: _('upgrade_confirmation'),
            choices: [
                {
                    name: _('ok'),
                    value: true
                },
                {
                    name: _('cancel'),
                    value: false
                }
            ],
            default: true
        });
        if (!confirm.value) {
            console.log('');
            return;
        }
    }

    await modifyPackageJsonAddKootVersion(cwd);

    const queue = await require('./determine-upgrade-queue')(cwd).catch(err => {
        spinner(_(`upgrade_error:${err.message ? err.message : err}`)).fail();
        console.log('');
        return;
    });

    if (!Array.isArray(queue)) {
        return;
    }

    if (!queue.length) {
        spinner(_('no_need_to_upgrade')).finish();
        console.log('');
        return;
    }

    let msgs = [];
    let warns = [];
    let errs = [];
    let filesChanged = [];
    let filesRemoved = [];

    for (let pair of queue) {
        const r = !Array.isArray(pair)
            ? await require('./upgrade-to-latest')(cwd, pair)
            : await require(`./upgrade-from-${pair[0]}-to-${pair[1]}`)(cwd);
        if (typeof r === 'object') {
            const { msg, warn, err, files = [], removed = [] } = r;
            msgs = msgs.concat(msg);
            warns = warns.concat(warn);
            errs = errs.concat(err);
            for (let f of files) {
                if (!filesChanged.includes(f)) filesChanged.push(f);
            }
            for (let f of removed) {
                if (!filesRemoved.includes(f)) filesRemoved.push(f);
            }
        }
    }

    msgs = msgs.filter(o => !!o);
    warns = warns.filter(o => !!o);
    errs = errs.filter(o => !!o);
    filesChanged = filesChanged.filter(o => !!o);
    filesRemoved = filesRemoved.filter(o => !!o);

    if (filesRemoved.length) {
        console.log('');
        console.log(_('upgrade_files_removed'));
        filesRemoved
            .map(pathname => path.relative(cwd, pathname))
            .forEach(filename => {
                spinner(filename).fail();
            });
    }

    if (filesChanged.length) {
        console.log('');
        console.log(_('upgrade_files_changed'));
        filesChanged
            .map(pathname => path.relative(cwd, pathname))
            .forEach(filename => {
                spinner(filename).finish();
            });
    }

    if (errs.length) {
        console.log('');
        for (let err of errs) spinner(err).fail();
    }

    if (warns.length) {
        console.log('');
        for (let warn of warns) spinner(warn).warn();
    }

    if (msgs.length) {
        console.log('');
        for (let msg of msgs) console.log(msg);
    }

    console.log('');
    console.log(chalk.cyanBright(_('whats_next')));
    console.log(chalk.cyanBright(`* `) + _(`step_install_dependencies`));
    console.log(`  ` + chalk.gray(`> npm i`));
    console.log('');
};
