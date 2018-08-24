const util = require('util')
const exec = util.promisify(require('child_process').exec)

global.KOOT_DIST_DIR = __dirname

const run = async () => {
    console.log('> npm install --no-save')

    const { stdout, stderr } = await exec(
        'npm install --no-save',
        {
            cwd: __dirname,
        }
    )

    console.log('\x1b[46m' + ' stdout ' + '\x1b[0m')
    console.log(stdout)
    console.log('\x1b[41m' + ' stderr ' + '\x1b[0m')
    console.log(stderr)

    console.log(' ')
    console.log('> Starting server')
    require('./server')
}

run().catch(err => console.trace(err))
