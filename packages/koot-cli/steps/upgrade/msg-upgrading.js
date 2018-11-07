const chalk = require('chalk')
const _ = require('../../lib/translate')

module.exports = (from, to) => (
    _('upgrading')
    + ' '
    + chalk.redBright(from)
    + ' -> '
    + chalk.cyanBright(to)
)
