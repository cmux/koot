const fs = require('fs-extra')

const getDirTemp = require('../libs/get-dir-tmp')

/**
 * 所有命令启动前
 * @async
 * @param {Object} [options={}]
 * @param {Boolean} [options.kootDev=false]
 * @void
 */
module.exports = async (options = {}) => {

    const {
        kootDev = false,
        args = []
    } = options
    const customArgs = {}

    // 清理临时目录
    if (!kootDev && typeof process.env.KOOT_PROJECT_CONFIG_FULL_PATHNAME !== 'string')
        await fs.remove(getDirTemp())

    // 定制环境变量
    {
        const keys = []
        args.forEach(arg => {
            const segs = arg.split('=')
            // envs[segs.shift()] = segs.join('=')
            const key = segs.shift()
            const value = segs.join('=')
            if (typeof process.env[key] !== 'undefined')
                throw new Error(`Environment Variable "${key}" exists and cannot be set!`)
            keys.push(key)
            process.env[key] = value
            customArgs[key] = value
        })

        if (typeof process.env.KOOT_CUSTOM_ENV_KEYS === 'undefined') {
            process.env.KOOT_CUSTOM_ENV_KEYS = JSON.stringify(keys)
        } else {
            const keysAll = JSON.parse(process.env.KOOT_CUSTOM_ENV_KEYS)
                .concat(keys)
            process.env.KOOT_CUSTOM_ENV_KEYS = JSON.stringify(keysAll)
        }
    }

    return { customArgs }
}
