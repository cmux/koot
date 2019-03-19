const fs = require('fs-extra')
const path = require('path')

const modifyDependency = require('../../../../packages/koot-cli/lib/modify-package-json/dependency')

const p = fs.readJSONSync(path.resolve(__dirname, 'package.json'))
afterEach(() => {
    fs.writeJSONSync(path.resolve(__dirname, 'package.json'), p)
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

    // test(`添加新的依赖，未提供版本号`, async () => {
    // })

    // test(`添加新的依赖，供版本号`, async () => {
    // })

    // test(`更新依赖，未提供版本号`, async () => {
    // })

    // test(`更新依赖，供版本号`, async () => {
    // })

    // test(`删除依赖`, async () => {
    // })

    // test(`添加新的 dev 依赖，未提供版本号 (devPedendencies 已在 package.json 中出现)`, async () => {
    // })

    // test(`添加新的 dev 依赖，供版本号 (devPedendencies 已在 package.json 中出现)`, async () => {
    // })

    // test(`添加新的 peer 依赖，供版本号 (peerPedendencies 没有在 package.json 中出现)`, async () => {
    // })

})
