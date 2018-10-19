const fs = require('fs-extra')
const path = require('path')
const validateConfig = require('../../libs/validate-config')

describe('测试: libs/validate-config', async () => {
    test(`#1`, async () => {
        const result = await validateConfig(path.resolve(__dirname, '../../.projects/koot-boilerplate'))
        console.log(result)
        expect(1).toBe(1)
    })
})
