const program = require('commander')
const pm2 = require('pm2')
const chalk = require('chalk')

const __ = require('../utils/translate')

program
    .version(require('../package').version, '-v, --version')
    .usage('[options]')
    .option('-c, --client', 'Set stage to CLIENT')
    .option('-s, --server', 'Set stage to SERVER')
    .parse(process.argv)

const run = async () => {
    const {
        client, server,
    } = program

    const stage = client ? 'client' : (server ? 'server' : false)

    if (!stage) {
        console.log(
            chalk.red('× ')
            + __('dev.missing_stage', {
                example: 'super-dev ' + chalk.green('--client'),
                indent: '  '
            })
        )
        return
    }

    console.log('STAGE: ' + stage)
}

run()
