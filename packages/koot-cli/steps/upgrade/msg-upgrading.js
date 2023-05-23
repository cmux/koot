import chalk from 'chalk';
import _ from '../../lib/translate.js';

const msgUpgrading = (from, to) =>
    _('upgrading') +
    ' ' +
    chalk.redBright(from) +
    ' -> ' +
    chalk.cyanBright(to);

export default msgUpgrading;
