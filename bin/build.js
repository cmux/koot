#!/usr/bin/env node

const program = require('commander')
const chalk = require('chalk')
const __ = require('../utils/translate')

program
    .version(require('../package').version, '-v, --version')
    .usage('<command> [options]')
    .option('--stage [stage]', 'STAGE')
    .option('--env [env]', 'ENV')
    .parse(process.argv)

const run = async () => {
    const {
        stage,
        env
    } = program

    if (!stage) {
        console.log(
            chalk.red('× ')
            + __('build.missing_option', {
                option: chalk.yellowBright('stage'),
                example: 'super-build ' + chalk.green('--stage client') + ' --env prod',
                indent: '  '
            })
        )
        return
    }

    if (!env) {
        console.log(
            chalk.red('× ')
            + __('build.missing_option', {
                option: chalk.yellowBright('env'),
                example: 'super-build --stage client ' + chalk.green('--env prod'),
                indent: '  '
            })
        )
        return
    }

    console.log(`Stage: ${stage} | ENV: ${env}`)
}

run()
