// jest configuration

jest.setTimeout(24 * 60 * 60 * 1 * 1000)

//

const fs = require('fs-extra')
const path = require('path')
const util = require('util')
const execSync = require('child_process').exec
const exec = util.promisify(require('child_process').exec)
const puppeteer = require('puppeteer')
const doTerminate = require('terminate')
const chalk = require('chalk')

//

const removeTempProjectConfig = require('../../../packages/koot/libs/remove-temp-project-config')
const sleep = require('../../../packages/koot/utils/sleep')
const { styles: puppeteerTestStyles } = require('../puppeteer-test')

//

global.kootTest = true
process.env.KOOT_TEST_MODE = JSON.stringify(true)

//

const projects = require('../../projects/get')()
const projectsToUse = projects.filter(project => (
    // Array.isArray(project.type) && project.type.includes('react-isomorphic')
    project.name === 'simple'
))

const commandTestBuild = 'koot-basetest'
const headless = true

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
 * 终止进程
 * @async
 * @param {*} pid 
 */
const terminate = async (pid) => new Promise((resolve, reject) => {
    doTerminate(pid, err => {
        if (err) return reject(err)
        resolve()
    })
})

/**
 * 通过检查子进程的输出/日志/log，等待、分析并返回端口号
 * @async
 * @param {Process} child 
 * @param {RegExp} regex 
 * @returns {Number} port
 */
const waitForPort = async (child, regex = /port.*\[32m([0-9]+)/) => await new Promise(resolve => {
    let port

    child.stdout.on('data', msg => {
        // console.log(msg)
        try {
            const obj = JSON.parse(msg)
            if (obj['koot-test']) {
                port = obj.port
            }
        } catch (e) { }

        if (!port) {
            const matches = regex.exec(msg)
            if (Array.isArray(matches) && matches.length > 1) {
                port = parseInt(matches[1])
            }
        }

        if (port) {
            return resolve(port)
        }
    })
})

/**
 * 测试项目
 * @async
 * @param {Number} port 
 * @param {Object} settings
 */
const doTest = async (port, settings = {}) => {

    const {
        isDev = false,
        enableJavascript = true,
    } = settings

    const defaultViewport = {
        width: 800,
        height: 800,
        deviceScaleFactor: 1
    }
    const checkBackgroundResult = (styleValue) => {
        return styleValue.match(/url\([ "']*(.+?)[ '"]*\)/g).every(assetUri => {
            return assetUri.includes(isDev ? `__koot_webpack_dev_server__/dist/assets` : `/includes/assets/`)
        })
    }
    const setScaleFactor = async (scale = 1) => {
        await page.setViewport({
            ...defaultViewport,
            deviceScaleFactor: scale
        })
        await page.waitFor(200)
    }

    const browser = await puppeteer.launch({
        headless,
        defaultViewport
    })
    const page = await browser.newPage()
    // await page.setJavaScriptEnabled(enableJavascript)
    if (!enableJavascript) {
        await page.setRequestInterception(true)
        page.on('request', (request) => {
            const url = request.url()
            if (/\.js$/.test(url)) request.abort()
            else request.continue()
        });
    }
    const origin = isNaN(port) ? port : `http://127.0.0.1:${port}`

    const res = await page.goto(origin, {
        waitUntil: 'networkidle0'
    }).catch()

    // 请求应 OK
    expect(res.ok()).toBe(true)

    { // base 图片应该引用打包结果的文件
        const resultBase = await page.evaluate(() => {
            const el = document.querySelector('[data-bg-type="base"]')
            if (!el) return ''
            return window.getComputedStyle(el).backgroundImage
        })
        expect(checkBackgroundResult(resultBase)).toBe(true)
    }

    { // respoinsive 图片应该引用打包结果的文件
        const test = async (scale) => {
            await setScaleFactor(scale);
            const result = await page.evaluate(() => {
                const el = document.querySelector('[data-bg-type="responsive"]')
                if (!el) return ''
                return window.getComputedStyle(el).backgroundImage
            })
            expect(checkBackgroundResult(result)).toBe(true)
        }
        await test(1.5);
        await test(2);
    }

    // 检查 koot-test-styles
    await puppeteerTestStyles(page)

    await browser.close()
}

/**
 * 测试项目开始前
 * @async
 * @param {String} cwd 
 */
const beforeTest = async (cwd) => {
    // 重置
    await exec(`pm2 kill`)
    await removeTempProjectConfig(cwd)
}

/**
 * 测试项目结束后
 * @async
 * @param {String} cwd 
 * @param {String} title 
 */
const afterTest = async (cwd, title) => {
    await sleep(2 * 1000)
    await exec(`pm2 kill`)
    // 移除临时项目配置文件
    await removeTempProjectConfig(cwd)

    console.log(chalk.green('√ ') + title)
}

//

describe('测试: React 同构项目', () => {

    for (let {
        name,
        dir,
    } of projectsToUse) {
        describe(`项目: ${name}`, () => {

            test(`ENV: prod`, async () => {
                await beforeTest(dir)

                const commandName = `${commandTestBuild}-prod`
                const command = `koot-start --koot-test`
                await addCommand(commandName, command, dir)

                const child = execSync(
                    `npm run ${commandName}`,
                    {
                        cwd: dir,
                    },
                )
                const errors = []

                await waitForPort(child)
                const port = require(path.resolve(dir, 'koot.config.js')).port
                child.stderr.on('data', err => {
                    errors.push(err)
                })

                expect(errors.length).toBe(0)

                await doTest(port)
                await doTest(port, { enableJavascript: false })
                await terminate(child.pid)
                await afterTest(dir, 'ENV: prod')
            })

            test(`ENV: dev`, async () => {
                await beforeTest(dir)

                // const port = '8316'
                const commandName = `${commandTestBuild}-isomorphic-dev`
                const command = `koot-dev --no-open --koot-test`
                await addCommand(commandName, command, dir)

                const child = execSync(
                    `npm run ${commandName}`,
                    {
                        cwd: dir,
                        stdio: ['pipe', 'pipe', 'pipe', 'ipc']
                    },
                )
                const errors = []

                const port = await waitForPort(child, / on.*http:.*:([0-9]+)/)
                child.stderr.on('data', err => {
                    errors.push(err)
                })

                // console.log({
                //     port,
                //     errors,
                // })
                expect(errors.length).toBe(0)

                await doTest(port, {
                    isDev: true
                })
                await doTest(port, {
                    isDev: true,
                    enableJavascript: false
                })
                await terminate(child.pid)
                await afterTest(dir, 'ENV: dev')
            })

        })
    }
})
