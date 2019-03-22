const fs = require('fs-extra')
const path = require('path')
const latestVersion = require('latest-version')

const modifyDependency = require('../../../../packages/koot-cli/lib/modify-package-json/dependency')

const filePackage = path.resolve(__dirname, 'package.json')
const p = fs.readJSONSync(filePackage)
afterEach(() => {
    fs.writeJSONSync(filePackage, p, { spaces: 4 })
})

describe('测试: 修改 package.json', () => {

    test(`若未提供 dir，应报错`, async () => {
        let error
        await modifyDependency()
            .catch(err => error = err)
        expect(error.message).toBe('`dir` not valid')
    })

    test(`若在 dir 中未找到 package.json，应报错`, async () => {
        let error
        await modifyDependency(path.resolve(__dirname, '../../'), 'koot')
            .catch(err => error = err)
        expect(error.message).toBe('`package.json` not found in target directory')
    })

    // test(`若 package.json 不合法，应报错`, async () => {
    //     let error
    //     await modifyDependency(path.resolve(__dirname, '../'), 'koot')
    //         .catch(err => error = err)
    //     expect(error.message).toBe('`package.json` not valid JSON file')
    // })

    test(`若没有提供 moduleName，应报错`, async () => {
        let error
        await modifyDependency(__dirname)
            .catch(err => error = err)
        expect(error.message).toBe('`moduleName` not valid')
    })

    test(`添加新的依赖，未提供版本号`, async () => {
        const m = 'eslint'
        const v = await latestVersion(m)
        await modifyDependency(__dirname, m)
        expect(fs.readJsonSync(filePackage).dependencies[m]).toBe(v)
    })

    test(`添加新的依赖，未提供版本号：依赖不存在，应报错`, async () => {
        const m = 'package_not_exist'
        let error
        await modifyDependency(__dirname, m)
            .catch(err => error = err)
        // expect(error.message).toBe(`Package \`${m}\` doesn't exist`)
        expect(
            [
                `Package \`${m}\` could not be found`,
                `Package \`${m}\` doesn't exist`
            ].includes(error.message)
        ).toBe(true)
    })

    test(`添加新的依赖，供版本号`, async () => {
        const m = 'eslint'
        const v = '1.0.0'
        await modifyDependency(__dirname, m, v)
        expect(fs.readJsonSync(filePackage).dependencies[m]).toBe(v)
    })

    test(`更新依赖，未提供版本号`, async () => {
        const m = 'react'
        const v = await latestVersion(m)
        await modifyDependency(__dirname, m)
        expect(fs.readJsonSync(filePackage).dependencies[m]).toBe(v)
    })

    test(`更新依赖，供版本号`, async () => {
        const m = 'react'
        const v = '1.0.0'
        await modifyDependency(__dirname, m, v)
        expect(fs.readJsonSync(filePackage).dependencies[m]).toBe(v)
    })

    test(`删除依赖`, async () => {
        const m = 'react'
        await modifyDependency(__dirname, m, false)
        expect(fs.readJsonSync(filePackage).dependencies[m]).toBe(undefined)
    })

    test(`添加新的 dev 依赖，未提供版本号 (devDependencies 已在 package.json 中出现)`, async () => {
        const m = 'eslint'
        const v = await latestVersion(m)
        await modifyDependency(__dirname, m, undefined, 'dev')
        expect(fs.readJsonSync(filePackage).devDependencies[m]).toBe(v)
    })

    test(`添加新的 dev 依赖，供版本号 (devDependencies 已在 package.json 中出现)`, async () => {
        const m = 'eslint'
        const v = '1.0.0'
        await modifyDependency(__dirname, m, v, 'dev')
        expect(fs.readJsonSync(filePackage).devDependencies[m]).toBe(v)
    })

    test(`添加新的 peer 依赖，供版本号 (peerDependencies 没有在 package.json 中出现)`, async () => {
        const m = 'eslint'
        const v = '1.0.0'
        await modifyDependency(__dirname, m, v, 'peer')
        expect(fs.readJsonSync(filePackage).peerDependencies[m]).toBe(v)
    })

})
