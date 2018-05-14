const program = require('commander')
const chalk = require('chalk')

const __ = require('../utils/translate')

program
    .version(require('../package').version, '-v, --version')
    .usage('[options]')
    .parse(process.argv)

const run = async () => {
    console.log('TODO: ANALYZE')
}

run()
