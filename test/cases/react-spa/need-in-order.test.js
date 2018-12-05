// jest configuration

jest.setTimeout(60 * 1 * 1000)

//

const fs = require('fs-extra')
const path = require('path')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
// const chalk = require('chalk')
const JSDOM = require('jsdom').JSDOM

//

const removeTempProjectConfig = require('../../../packages/koot/libs/remove-temp-project-config')
const sleep = require('../../../packages/koot/utils/sleep')

//

const projects = require('../../projects/get')()
const projectsToUse = projects.filter(project => (
    // Array.isArray(project.type) && project.type.includes('react-isomorphic')
    project.name === 'standard'
))
const commandTestBuild = 'koot-buildtest'

//

/**
 * 向 package.json 里添加 npm 命令
 * @async
 * @param {String} name 
 * @param {String} command 
 * @param {String} cwd 
 */
const addCommand = async (name, command, cwd) => {
    const pathPackage = path.resolve(cwd, 'package.json')
    const p = await fs.readJson(pathPackage)
    // if (!p.scripts[name])
    p.scripts[name] = command
    await fs.writeJson(pathPackage, p, {
        spaces: 4
    })
}

/**
 * 测试项目开始前
 * @async
 * @param {String} cpd Current Project Directory
 * @param {String} dist 
 */
const beforeTest = async (cpd) => {
    await removeTempProjectConfig(cpd)
}

/**
 * 测试项目结束后
 * @async
 * @param {String} cpd Current Project Directory
 * @param {String} dist 
 * @param {String} title 
 */
const afterTest = async (cpd/*, title*/) => {
    await sleep(2 * 1000)
    await removeTempProjectConfig(cpd)

    // console.log(chalk.green('√ ') + title)
}

describe('测试: React SPA 项目', async () => {

    for (let {
        name,
        dir,
    } of projectsToUse) {

        describe(`项目: ${name}`, async () => {

            const dist = path.resolve(dir, 'dist-spa-test')
            const fileIndexHtml = path.resolve(dist, 'index.html')

            if (fs.existsSync(dist))
                fs.emptyDirSync(dist)
            else
                fs.removeSync(dist)

            test(`使用 koot-build 命令进行生产模式打包，打包应该成功`, async () => {
                await beforeTest(dir)

                const commandName = `${commandTestBuild}-spa-build`
                const command = `koot-build --type react-spa --dest ${dist} --koot-test`
                await addCommand(commandName, command, dir)

                // console.log(commandName)
                const { /*stdout,*/ stderr } = await exec(
                    `npm run ${commandName}`, {
                        cwd: dir,
                    }
                )

                // console.log(stderr)

                expect(typeof stderr).toBe('string')
                expect(stderr).toBe('')

                await afterTest(dir, '[Production] 使用 koot-build 命令进行打包')
            })

            test(`打包完成后，index.html 应该存在，且内容应该正确`, async () => {
                const exist = fs.existsSync(fileIndexHtml)
                expect(exist).toBe(true)

                if (exist) {
                    const dom = new JSDOM(fs.readFileSync(fileIndexHtml))
                    const config = require(path.resolve(dir, 'koot.config.js'))
                    expect(
                        dom.window.document.querySelector('title').textContent
                    ).toBe(config.name)
                }
            })

            // TODO: 测试: 有 extract.all.[*].css

            // TODO: 测试: 所有 Webpack 结果资源的访问

            // TODO: 测试: extend connect 的 Array 用法

            if (fs.existsSync(dist))
                fs.removeSync(dist)

        })
    }
})
