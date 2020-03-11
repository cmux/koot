/**
 * 步骤: 输入 - 项目名
 */

/**
 * @typedef {Object} ProjectInuiryResult
 * @property {number} x - The X Coordinate
 * @property {number} y - The Y Coordinate
 */

const path = require('path');
const inquirer = require('inquirer');
const npmEmail = require('npm-email');

const _ = require('../../lib/translate');
const spinner = require('../../lib/spinner');

const getProjectFolder = require('./get-project-folder');

// ============================================================================

inquirer.registerPrompt('directory', require('inquirer-select-directory'));

// ============================================================================

/**
 * 询问项目信息
 * @async
 * @param {Object} [options={}]
 * @param {boolean} [options.isCMNetwork=false] 是否处于 CM 内网
 * @returns
 */
module.exports = async (options = {}) => {
    const app = {
        cwd: process.cwd()
    };
    const prompt = async (options = {}) => {
        const answers = await inquirer.prompt(
            Array.isArray(options) ? options : [options]
        );
        for (const [key, value] of Object.entries(answers)) {
            if (typeof app[key] !== 'undefined')
                throw new Error(`property '${key}' exists!`);
            app[key] = value;
        }
    };
    const defaultEventEmitterMaxListeners = require('events').EventEmitter
        .defaultMaxListeners;
    require('events').EventEmitter.defaultMaxListeners = 30;

    // ========================================================================

    const { isCMNetwork } = options;

    // ========================================================================
    //
    // 项目名称
    //
    // ========================================================================
    await prompt({
        type: 'input',
        name: 'name',
        message: _('project_name_required'),
        validate: input => {
            if (input === 0 || input) return true;
            return _('project_name_needed');
        }
    });
    // TODO sanitize

    // ========================================================================
    //
    // 项目描述
    //
    // ========================================================================
    await prompt({
        type: 'input',
        name: 'description',
        message: _('project_description')
    });

    // ========================================================================
    //
    // 项目类型
    //
    // ========================================================================
    const appTypes = ['ssr', 'spa'];
    await prompt({
        type: 'list',
        name: 'type',
        message: _('project_type'),
        choices: appTypes.map(value => ({
            name: _('project_types')[value],
            value,
            short: _('project_types')[value + '_short']
        })),
        default: appTypes[0]
    });

    // ========================================================================
    //
    // 模板类型
    //
    // ========================================================================
    const boilerplateTypes = ['base', 'serverless'];
    if (isCMNetwork) boilerplateTypes.push('cm-system');
    await prompt({
        type: 'list',
        name: 'boilerplate',
        message: _('project_boilerplate'),
        choices: boilerplateTypes.map(value => ({
            name: _('project_boilerplates')[value],
            value,
            short: _('project_boilerplates')[value + '_short']
        })),
        default: boilerplateTypes[0]
    });

    // ========================================================================
    //
    // 开发者
    //
    // ========================================================================
    await prompt({
        type: 'input',
        name: 'author',
        message: _('project_author')
    });
    // 分析用户名
    if (typeof app.author === 'number') {
        app.author = '' + app.author;
    }
    if (typeof app.author === 'string' && app.author !== '') {
        const name = app.author;
        app.author = {
            name
        };
        const waiting = spinner();
        const email = await npmEmail(name).catch(() => {});
        waiting.stop();
        if (email) app.author.email = email;
    } else {
        delete app.author;
    }

    // ========================================================================
    //
    // 项目路径
    //
    // ========================================================================
    await prompt({
        type: 'list',
        name: 'dest',
        message: _('project_project_dir'),
        choices: [
            (() => {
                const dest = `./${app.name}`;
                return {
                    name: _('project_project_dir_types')['sub'] + ` (${dest})`,
                    value: path.resolve(app.cwd, dest),
                    short: dest
                };
            })(),
            (() => {
                const dest = `./`;
                return {
                    name: _('project_project_dir_types')['curr'] + ` (${dest})`,
                    value: path.resolve(app.cwd, dest),
                    short: dest
                };
            })(),
            {
                name: _('project_project_dir_types')['input'],
                value: true
                // short: '...'
            }
        ]
    });
    if (app.dest === true) {
        Object.assign(
            app,
            await inquirer.prompt({
                type: 'directory',
                name: 'dest',
                message: _('project_project_dir_select'),
                basePath: `./`
            })
        );
    }
    Object.assign(app, await getProjectFolder(app.dest));

    // ========================================================================
    //
    // 包管理器
    //
    // ========================================================================
    await prompt({
        type: 'list',
        name: 'packageManager',
        message: _('project_package_manager'),
        choices: Object.entries(_('project_package_managers')).map(
            ([key, value]) => ({
                name: value,
                value: key,
                short: _('project_package_managers')[key + '_short']
            })
        )
    });

    // ========================================================================
    //
    // 打包结果路径
    //
    // ========================================================================
    // Object.assign(
    //     app,
    //     await inquirer.prompt({
    //         type: 'input',
    //         name: 'dist',
    //         message: _('project_dist_dir'),
    //         default: './dist',
    //         validate: input => {
    //             if (input === 0 || input) return true;
    //             return _('project_dist_dir_needed');
    //         }
    //     })
    // );
    // while (['\\', '/'].includes(app.dist.substr(app.dist.length - 1))) {
    //     app.dist = app.dist.substr(0, app.dist.length - 1);
    // }

    // UI 开发框架
    // app.framework = 'react';

    require('events').EventEmitter.defaultMaxListeners = defaultEventEmitterMaxListeners;

    return app;
};
