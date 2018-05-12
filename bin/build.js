#!/usr/bin/env node

const program = require('commander')

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
        console.log('no --stage')
        return
    }

    if (!env) {
        console.log('no --env')
        return
    }

    console.log(`Stage: ${stage} | ENV: ${env}`)
}

run()
