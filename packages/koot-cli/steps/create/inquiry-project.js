/**
 * 步骤: 输入 - 项目名
 */

/**
 * @typedef {Object} ProjectInuiryResult
 * @property {number} x - The X Coordinate
 * @property {number} y - The Y Coordinate
 */

const inquirer = require('inquirer');
const npmEmail = require('npm-email');

const _ = require('../../lib/translate');
const spinner = require('../../lib/spinner');

/**
 * 询问项目信息
 * @async
 * @param {Object} [options={}]
 * @param {boolean} [options.isCMNetwork=false] 是否处于 CM 内网
 * @returns
 */
module.exports = async (options = {}) => {
    const project = {};
    const prompt = async (options = {}) => {
        const answers = await inquirer.prompt(
            Array.isArray(options) ? options : [options]
        );
        for (const [key, value] of Object.entries(answers)) {
            if (typeof project[key] !== 'undefined')
                throw new Error(`property '${key}' exists!`);
            project[key] = value;
        }
    };

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
            value
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
            value
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
    if (typeof project.author === 'number') {
        project.author = '' + project.author;
    }
    if (typeof project.author === 'string' && project.author !== '') {
        const name = project.author;
        project.author = {
            name
        };
        const waiting = spinner();
        const email = await npmEmail(name).catch(() => {});
        waiting.stop();
        if (email) project.author.email = email;
    } else {
        delete project.author;
    }

    // ========================================================================
    //
    // 打包结果路径
    //
    // ========================================================================
    Object.assign(
        project,
        await inquirer.prompt({
            type: 'input',
            name: 'dist',
            message: _('project_dist_dir'),
            default: './dist',
            validate: input => {
                if (input === 0 || input) return true;
                return _('project_dist_dir_needed');
            }
        })
    );
    while (['\\', '/'].includes(project.dist.substr(project.dist.length - 1))) {
        project.dist = project.dist.substr(0, project.dist.length - 1);
    }

    // UI 开发框架
    project.framework = 'react';

    // 项目模式
    // Object.assign(project,
    //     await inquirer.prompt({
    //         type: 'list',
    //         name: 'mode',
    //         message: _('project_mode'),
    //         choices: [
    //             {
    //                 name: _('project_mode_isomorphic'),
    //                 value: 'isomorphic'
    //             },
    //             {
    //                 name: _('project_mode_spa'),
    //                 value: 'spa'
    //             },
    //         ],
    //         default: 'isomorphic'
    //     })
    // )

    // 多语言
    // Object.assign(project,
    //     await inquirer.prompt({
    //         type: 'list',
    //         name: 'i18n',
    //         message: _('project_i18n_enabled'),
    //         choices: [
    //             {
    //                 name: _('yes'),
    //                 value: true
    //             },
    //             {
    //                 name: _('no'),
    //                 value: false
    //             },
    //         ],
    //         default: true
    //     })
    // )
    // if (project.i18n) {

    // }

    return project;
};
