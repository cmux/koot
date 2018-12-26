const fs = require('fs-extra')
const path = require('path')

const validateConfig = require('../../../packages/koot/libs/validate-config')

const samplesDir = path.resolve(__dirname, 'samples')
const samples = fs.readdirSync(samplesDir)
    .map(filename => ({
        name: path.parse(filename).name,
        file: path.resolve(samplesDir, filename),
        filename
    }))



// ============================================================================

const debug = require('debug')
const run = async () => {
    for (const sample of samples) {
        await validateSample(sample)
    }
}
const validateSample = async (sample) => {
    console.log('')

    const { name, file, filename } = sample

    const log = debug(name)
    debug.enable(name)
    log('')

    if (name !== 'full-0.7')
        return log('not 0.7. exit')

    const resultDir = path.resolve(samplesDir, name)
    await fs.ensureDir(resultDir)
    await fs.emptyDir(resultDir)

    const kootConfig = await validateConfig(samplesDir, {
        configFilename: filename,
        tmpDir: resultDir
    })

    log(kootConfig)

    // await fs.remove(resultDir)
}
run()


// ============================================================================

return

describe('测试: 验证配置 (生成临时的核心代码引用文件，返回其他配置对象)', async () => {
})
