/**
 * 步骤: 输入 - 项目名
 */

const inquirer = require('inquirer')
const npmEmail = require('npm-email')

const _ = require('../../lib/translate')
const spinner = require('../../lib/spinner')

module.exports = async () => {
    const project = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: _('project_name_required'),
            validate: (input) => {
                if (input === 0 || input) return true
                return _('project_name_needed')
            }
        },
        {
            type: 'input',
            name: 'description',
            message: _('project_description')
        },
        {
            type: 'input',
            name: 'author',
            message: _('project_author')
        },
    ])

    // 分析用户名
    if (typeof project.author === 'number') {
        project.author = '' + project.author
    }
    if (typeof project.author === 'string' && project.author !== '') {
        const name = project.author
        project.author = {
            name
        }
        const waiting = spinner()
        const email = await npmEmail(name)
            .catch(() => { })
        waiting.stop()
        if (email) project.author.email = email
    } else {
        delete project.author
    }

    // JS框架
    project.framework = 'react'

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

    // 打包结果路径
    Object.assign(project,
        await inquirer.prompt({
            type: 'input',
            name: 'dist',
            message: _('project_dist_dir'),
            default: './dist',
            validate: (input) => {
                if (input === 0 || input) return true
                return _('project_dist_dir_needed')
            }
        })
    )
    while (['\\', '/'].includes(project.dist.substr(project.dist.length - 1))) {
        project.dist = project.dist.substr(0, project.dist.length - 1)
    }

    return project
}
