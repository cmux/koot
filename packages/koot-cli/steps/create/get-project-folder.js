const fs = require('fs-extra')
const path = require('path')
const inquirer = require('inquirer')
const chalk = require('chalk')

const _ = require('../../lib/translate')
const spinner = require('../../lib/spinner')

/**
 * 获取项目路径
 * @async
 * @param {Object}} project 
 */
module.exports = async (project = {}) => {
    let dest = path.resolve(process.cwd(), project.name)

    if (fs.existsSync(dest)) {
        const overwrite = await inquirer.prompt({
            type: 'list',
            name: 'value',
            message: _('confirm_remove_exist_dir'),
            choices: [
                'remove',
                'overwrite',
                'input'
            ].map(value => ({
                name: _(`confirm_remove_exist_dir_${value}`),
                value
            }))
        })
        switch (overwrite.value) {
            case 'remove': {
                const waiting = spinner(chalk.whiteBright(_('removing_exist_dir')) + '...')
                try {
                    await fs.remove(dest)
                } catch (err) { }
                waiting.stop()
                spinner(chalk.whiteBright(_('removing_exist_dir'))).finish()
                break
            }
            case 'input': {
                const input = await inquirer.prompt({
                    type: 'input',
                    name: 'value',
                    message: _('input_dir'),
                    default: `./${project.name}`,
                    validate: (input) => {
                        if (input === 0 || input) {
                            try {
                                const dest = path.resolve(process.cwd(), input)
                                if (fs.existsSync(dest))
                                    return _('dir_exist')
                            } catch (e) {
                                return _('invalid_input')
                            }
                            return true
                        }
                        return _('invalid_input')
                    },
                })
                dest = path.resolve(process.cwd(), input.value)
                break
            }
        }
    }

    return dest
}
