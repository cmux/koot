#!/usr/bin/env node

const program = require('commander')
// const chalk = require('chalk')

// const __ = require('../utils/translate')

program
    .version(require('../package').version, '-v, --version')
    .usage('[options]')
    .parse(process.argv)

const run = async () => {
    // 清空 log
    process.stdout.write('\x1B[2J\x1B[0f')

    console.log('TODO: ANALYZE')
}

run()
