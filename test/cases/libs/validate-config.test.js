const fs = require('fs-extra')
const path = require('path')

const validateConfig = require('../../../packages/koot/libs/validate-config')
const {
    keyFileProjectConfigTempFull,
    keyFileProjectConfigTempPortionServer,
    keyFileProjectConfigTempPortionClient
} = require('../../../packages/koot/defaults/before-build')
const getDirDevTemp = require('../../../packages/koot/libs/get-dir-dev-tmp')

const filesToClear = []

afterAll(() => {
    // 清理临时文件
    for (const file of filesToClear) {
        fs.removeSync(file)
    }
})

describe(`测试: libs/validate-config`, () => {

    const fileKeysToCheck = [
        keyFileProjectConfigTempFull,
        keyFileProjectConfigTempPortionServer,
        keyFileProjectConfigTempPortionClient
    ]

    test(`默认环境 (生产环境)`, async () => {

        const buildConfig = await validateConfig(path.resolve(__dirname, '../../projects/standard'))

        for (const key of fileKeysToCheck) {
            const file = buildConfig[key]
            const content = await fs.readFile(file, 'utf-8')
            filesToClear.push(file)
            expect(fs.existsSync(file)).toBe(true)
            expect(typeof content).toBe('string')
        }

        expect(typeof buildConfig).toBe('object')
    })

    test(`强行指定开发环境`, async () => {

        const envLast = {
            WEBPACK_BUILD_ENV: process.env.WEBPACK_BUILD_ENV
        }
        process.env.WEBPACK_BUILD_ENV = 'dev'

        const cwd = path.resolve(__dirname, '../../projects/standard')
        const buildConfig = await validateConfig(cwd)

        for (const key of fileKeysToCheck) {
            const file = buildConfig[key]
            const content = await fs.readFile(file, 'utf-8')
            filesToClear.push(file)
            expect(fs.existsSync(file)).toBe(true)
            expect(typeof content).toBe('string')
        }

        expect(typeof buildConfig).toBe('object')
        expect(buildConfig.dist).toBe(getDirDevTemp(undefined, 'build'))

        // 还原环境变量
        Object.keys(envLast).forEach(key => {
            process.env[key] == envLast[key]
        })
    })

})
