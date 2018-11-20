const fs = require('fs-extra')
const path = require('path')

const validateConfig = require('../../../packages/koot/libs/validate-config')
const { keyFileProjectConfigTemp } = require('../../../packages/koot/defaults/before-build')

test(`测试: libs/validate-config`, async () => {

    const {
        [keyFileProjectConfigTemp]: fileProjectConfig,
        ...buildConfig
    } = await validateConfig(path.resolve(__dirname, '../../projects/standard'))

    expect(fs.existsSync(fileProjectConfig)).toBe(true)
    const contentProjectConfig = await fs.readFile(fileProjectConfig, 'utf-8')

    // 移除临时项目配置文件
    await fs.remove(fileProjectConfig)

    expect(typeof buildConfig).toBe('object')
    expect(typeof contentProjectConfig).toBe('string')
})
