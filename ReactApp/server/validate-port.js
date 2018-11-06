const fs = require('fs-extra')
const isPortReachable = require('is-port-reachable')
const inquirer = require('inquirer')
// const osLocale = require('os-locale')

const getPathnameDevServerStart = require('../../utils/get-pathname-dev-server-start')

/**
 * 验证服务器启动端口
 * 
 * 依次检查以下变量/常量，当发现可用值时进入下一步
 *     `__SERVER_PORT__`
 *     process.env.SERVER_PORT
 * 
 * 检查设定好的端口号是否可用
 * 如果可用，直接返回结果
 * 如果不可用，提示下一步操作
 * 
 * @async
 * @returns {Number|Boolean} 如果最终没有结果，返回 false，否则返回可用的端口数
 */
module.exports = async () => {
    // const locale = osLocale.sync()
    // console.log('locale', locale)

    // __SERVER_PORT__ 为打包的全局变量
    // 设置环境变量
    if (typeof process.env.SERVER_PORT === 'undefined' && typeof __SERVER_PORT__ !== 'undefined')
        process.env.SERVER_PORT = __SERVER_PORT__

    // 判断当前环境变量中的端口号是否可用
    const port = await validate(process.env.SERVER_PORT)

    // 如果可用，返回该端口号
    if (port) return port

    // 如果不可用
    logPortTaken(process.env.SERVER_PORT)

    // 开发模式
    if (__DEV__) {
        // 修改开发模式服务器启动临时文件
        await fs.writeFile(
            getPathnameDevServerStart(),
            `port ${process.env.SERVER_PORT} has been taken.`,
            'utf-8'
        )
        // 跳出
        return false
    }

    let isPortTaken = true
    let result

    while (isPortTaken) {
        const askForPort = await inquirer.prompt([{
            type: 'input',
            name: 'port',
            message: 'Please input a new port number (leave empty for cancel)',
            validate: (input) => {
                if (!input) return true
                if (isNaN(input)) 'Must be a number or null'
                return true
            }
        }])
        if (!askForPort.port) {
            isPortTaken = false
            result = undefined
        } else {
            result = await validate(askForPort.port)
            isPortTaken = !result ? true : false
            if (isPortTaken) logPortTaken(askForPort.port)
        }
    }

    if (result) return result
    return false
}

/**
 * 验证目标端口是否可用
 * @async
 * @param {Number|String} port 
 * @returns {Boolean}
 */
const validate = async (port) => {
    const isPortOpen = !(await isPortReachable(port))
    if (isPortOpen)
        return port
    return false
}

/**
 * log: 目标端口被占用
 * @param {Number|String} port 
 */
const logPortTaken = (port) => {
    console.log(`\x1b[31m×\x1b[0m ` + `\x1b[93m[koot/server]\x1b[0m port \x1b[32m${port}\x1b[0m has been taken.`)
}
