const fs = require('fs-extra')
const path = require('path')

const getCwd = require('./require-koot')('utils/get-cwd')
const log = require('./require-koot')('libs/log')

/** @type {Number} 同类型的日志文件保存的数量 (超过的日志文件会被删除) */
const filesSameTypeKeep = 1
// const daysToKeep = 2

/** @type {String} 日志记录文件存放路径 (相对于项目根目录) */
const pathname = './logs/webpack-config'

/**
 * 将 Webpack 配置写入日志文件，并清理旧文件
 * @async
 * @param {Object} config Webpack 配置对象
 * @param {Object} [option] 选项
 * @param {Boolean} [option.quietMode=false] 是否为安静模式，如果开启不会打出 console log
 * @param {Boolean} [option.createDll=false] 本次打包是否为生成 DLL
 * @param {Boolean} [option.analyze=false] 是否为分析模式
 */
module.exports = async (config = {}, options = {}) => {
    // 扩展不支持 toJSON 的类
    Object.defineProperty(RegExp.prototype, "toJSON", {
        value: RegExp.prototype.toString
    })

    const {
        quietMode = false,
        createDll = false,
        analyze = false,
    } = options

    const {
        WEBPACK_BUILD_TYPE: TYPE,
        WEBPACK_BUILD_ENV: ENV,
        WEBPACK_BUILD_STAGE: STAGE,
    } = process.env

    /** @type {String} 日志记录文件存放路径 (绝对路径) */
    const dir = path.resolve(getCwd(), pathname)

    // 确保目录
    await fs.ensureDir(dir)

    /** @type {String} 文件名中的类型部分 */
    const filenameSegMode = (() => {
        if (createDll) return '.dll'
        if (analyze) return '.analyze'
        return ''
    })()
    const filenameTypename = `${TYPE}.${STAGE}.${ENV}${filenameSegMode}`

    // 清理目录
    {
        const files = await fs.readdir(dir)
        // const now = Date.now()
        const filesToDelete = files
            // 将 filename 转为绝对路径
            .map(filename => path.resolve(dir, filename))
            // 选出当前类型的日志文件
            .filter(file => {
                const { base } = path.parse(file)
                return (new RegExp(`^${filenameTypename.replace(/\./g, '\\.')}\\.(((?!dll\\.).)+?)\\.json$`)).test(base)
            })
            // 根据创建日期排序 (新 -> 旧)
            .sort((a, b) => fs.lstatSync(b).ctimeMs - fs.lstatSync(a).ctimeMs)
            // 选择除最近 4 个文件外的其他文件
            .filter((file, index) => index > filesSameTypeKeep - 1)
        // .filter(filename => {
        //     const file = path.resolve(dir, filename)
        //     const { ctimeMs } = fs.lstatSync(file)
        //     return now - ctimeMs > daysToKeep * 24 * 60 * 60 * 1000
        // })
        // .map(filename => path.resolve(dir, filename))
        for (let file of filesToDelete) {
            // console.log(file)
            await fs.remove(file)
        }
    }

    try {
        await fs.writeFile(
            path.resolve(dir,
                `${filenameTypename}.${(new Date()).toISOString().replace(/:/g, '_')}.json`
            ),
            JSON.stringify(config, null, '\t'),
            'utf-8'
        )
    } catch (err) {
        if (!quietMode)
            log('error', 'build',
                `write webpack config to file failed`
            )
    }
}
