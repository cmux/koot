const fs = require('fs-extra')
const path = require('path')
const validatePathname = require('../../../libs/validate-pathname')

const doTest = (p) => {
    const pathname = validatePathname(p)
    expect(
        fs.existsSync(pathname)
    ).toBe(true)
}

describe('测试: libs/validate-pathname', async () => {
    test(`当前路径的相对路径`, async () => doTest(path.resolve(__dirname, '../pre-test.js')))
    test(`项目根目录的相对路径 (写法#1)`, async () => doTest('LICENSE'))
    test(`项目根目录的相对路径 (写法#2)`, async () => doTest('./LICENSE'))
    test(`node_modules`, async () => doTest('koa/package.json'))
    test(`绝对路径`, async () => doTest('C:\\Users\\diablohu\\.npmrc'))
})
