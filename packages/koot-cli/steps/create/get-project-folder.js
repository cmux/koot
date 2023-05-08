import path from 'node:path';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import chalk from 'chalk';

import _ from '../../lib/translate.js';
import spinner from '../../lib/spinner.js';

/**
 * 获取项目路径
 * @async
 * @param {Object}} project
 */
const getProjectFolder = async (project = {}) => {
    const cwd = project.cwd || process.cwd();

    /** 目标目录路径 */
    let dest =
        typeof project === 'string' ? project : path.resolve(cwd, project.name);
    /** 目标目录是否已经存在 */
    let destExists = false;

    if (fs.existsSync(dest)) {
        destExists = true;

        const { value: overwrite } = await inquirer.prompt({
            type: 'list',
            name: 'value',
            message: _('confirm_remove_exist_dir'),
            choices: ['remove', 'overwrite', 'input'].map((value) => ({
                name: _(`confirm_remove_exist_dir_${value}`),
                value,
            })),
        });

        switch (overwrite) {
            case 'remove': {
                const waiting = spinner(
                    chalk.whiteBright(_('removing_exist_dir')) + '...'
                );
                try {
                    await fs.remove(dest);
                } catch (err) {}
                waiting.stop();
                spinner(chalk.whiteBright(_('removing_exist_dir'))).finish();
                break;
            }
            case 'input': {
                const input = await inquirer.prompt({
                    type: 'input',
                    name: 'value',
                    message: _('input_dir'),
                    default: `./${project.name || ''}`,
                    validate: (input) => {
                        if (input === 0 || input) {
                            try {
                                const dest = path.resolve(cwd, input);
                                if (fs.existsSync(dest)) return _('dir_exist');
                            } catch (e) {
                                return _('invalid_input');
                            }
                            return true;
                        }
                        return _('invalid_input');
                    },
                });
                dest = path.resolve(cwd, input.value);
                break;
            }
            default: {
            }
        }
    }

    let destRelative = path.relative(cwd, dest);
    if (!/^\./.test(destRelative)) destRelative = `./${destRelative}`;

    return {
        dest,
        destExists,
        destRelative,
    };
};

export default getProjectFolder;
