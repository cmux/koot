const fs = require('fs-extra')
const path = require('path')

const getCwd = require('../../../../utils/get-cwd')
const log = require('../../../../libs/log')

const daysToKeep = 2

/**
 * 清理配置记录目录并写入新的记录
 * @async
 */
module.exports = async (config = {}, options = {}) => {
    const {
        quietMode = false
    } = options

    const {
        WEBPACK_BUILD_TYPE: TYPE,
        WEBPACK_BUILD_ENV: ENV,
        WEBPACK_BUILD_STAGE: STAGE,
    } = process.env
    const dir = path.resolve(getCwd(), `./logs/webpack-config`)

    // 确保目录
    await fs.ensureDir(dir)

    // 清理目录
    {
        const files = await fs.readdir(dir)
        const now = Date.now()
        const filesToDelete = files.filter(filename => {
            const file = path.resolve(dir, filename)
            const { ctimeMs } = fs.lstatSync(file)
            return now - ctimeMs > daysToKeep * 24 * 60 * 60 * 1000
        }).map(filename => path.resolve(dir, filename))
        for (let file of filesToDelete)
            await fs.remove(file)
    }

    try {
        await fs.writeFile(
            path.resolve(dir,
                `${TYPE}.${STAGE}.${ENV}.${(new Date()).toISOString().replace(/:/g, '_')}.json`
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
