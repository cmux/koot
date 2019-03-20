const { spawn } = require('child_process')

const logRunScript = require('./log/run-script')

/**
 * 运行指定脚本
 * @async
 * @param {String} script 
 * @param {Object} [options]
 * @param {Boolean} [options.logBeforeRun=true] 是否在运行脚本前输出脚本信息
 * @return {Promise}
 */
const run = async (script, options = {}) => {
    const {
        logBeforeRun = true
    } = options

    if (logBeforeRun)
        logRunScript(script)

    const arr = script.split(' ')
    await new Promise(resolve => {
        const child = spawn(
            arr.shift(),
            arr,
            {
                stdio: 'inherit',
                shell: true,
            }
        )
        child.on('close', () => {
            resolve()
        })
    })
}

module.exports = run
