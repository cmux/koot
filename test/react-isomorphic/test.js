const fs = require('fs-extra')
const path = require('path')
const util = require('util')
const execSync = require('child_process').exec
const exec = util.promisify(execSync)
const puppeteer = require('puppeteer')
const doTerminate = require('terminate')

//

const { dir: dirProjects, projects, commandTestBuild } = require('../projects')
const projectsToUse = projects.filter(project => (
    Array.isArray(project.type) && project.type.includes('react-isomorphic')
))
const { changeLocaleQueryKey } = require('../../defaults/defines')
const removeTempProjectConfig = require('../../libs/remove-temp-project-config')
// const sleep = require('../../utils/sleep')

//

global.kootTest = true
process.env.KOOT_TEST_MODE = JSON.stringify(true)

//

const addCommand = async (name, command, dir) => {
    const pathPackage = path.resolve(dir, 'package.json')
    const p = await fs.readJson(pathPackage)
    // if (!p.scripts[name])
    p.scripts[name] = command
    await fs.writeJson(pathPackage, p, {
        spaces: 4
    })
}
const terminate = async (pid) => new Promise((resolve, reject) => {
    doTerminate(pid, err => {
        if (err) return reject(err)
        resolve()
    })
})
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
const testPage = async (port) => {
    const browser = await puppeteer.launch({
        // headless: false
    })
    const page = await browser.newPage()
    const url = isNaN(port) ? port : `http://127.0.0.1:${port}`

    {
        const res = await page.goto(url, {
            waitUntil: 'networkidle0'
        }).catch()
        const pageTitle = await page.evaluate(() => document.querySelector('title').innerText)
        const $app = await page.$('#app')

        expect(res.ok()).toBe(true)
        expect(typeof pageTitle).toBe('string')
        expect(typeof $app).toBe('object')
    }
    {
        await page.goto(`${url}?${changeLocaleQueryKey}=zh`, {
            waitUntil: 'networkidle0'
        })
        const localeId = await page.evaluate(() => document.querySelector('meta[name="koot-locale-id"]').getAttribute('content'))
        expect(localeId).toBe('zh')
    }
    {
        await page.goto(`${url}?${changeLocaleQueryKey}=en`, {
            waitUntil: 'networkidle0'
        })
        const localeId = await page.evaluate(() => document.querySelector('meta[name="koot-locale-id"]').getAttribute('content'))
        expect(localeId).toBe('en')
    }

    const testLinksToOtherLang = async (urlAppend) => {
        await page.goto(`${url}${urlAppend}`, {
            waitUntil: 'networkidle0'
        })

        const localeId = await page.evaluate(() => document.querySelector('meta[name="koot-locale-id"]').getAttribute('content'))
        const linksToOtherLang = await page.$$eval(`link[rel="alternate"][hreflang][href]:not([hreflang="${localeId}"])`, els => (
            Array.from(els).map(el => ({
                lang: el.getAttribute('hreflang'),
                href: el.getAttribute('href')
            }))
        ))
        expect(Array.isArray(linksToOtherLang)).toBe(true)
        expect(linksToOtherLang.length).toBeGreaterThan(0)

        for (let { lang, href } of linksToOtherLang) {
            await page.goto(href, {
                waitUntil: 'networkidle0'
            })
            const localeId = await page.evaluate(() => document.querySelector('meta[name="koot-locale-id"]').getAttribute('content'))
            expect(lang).toBe(localeId)
        }
    }
    await testLinksToOtherLang('')
    await testLinksToOtherLang(`?${changeLocaleQueryKey}=zh`)
    await testLinksToOtherLang('?test=a')
    await testLinksToOtherLang(`?test=a&${changeLocaleQueryKey}=zh`)

    await browser.close()
}

//

describe('测试: React 同构项目', async () => {

    for (let project of projectsToUse) {
        const { name } = project
        const dir = path.resolve(dirProjects, name)

        describe(`项目: ${name}`, async () => {
            test(`[Production] 使用 koot-build 命令进行打包`, async () => {
                const commandName = `${commandTestBuild}-isomorphic-build`
                const command = `koot-build --env prod --koot-test`
                await addCommand(commandName, command, dir)

                const { /*stdout,*/ stderr } = await exec(
                    `npm run ${commandName}`, {
                        cwd: dir,
                    }
                )

                expect(typeof stderr).toBe('string')
                expect(stderr).toBe('')
            })
            test(`[Production] 使用 koot-start (--no-build) 命令启动服务器并访问`, async () => {
                const commandName = `${commandTestBuild}-isomorphic-start-server`
                const command = `koot-start --no-build`
                await addCommand(commandName, command, dir)

                const child = execSync(
                    `npm run ${commandName}`,
                    {
                        cwd: dir,
                    },
                    // (err, stdout, stderr) => {
                    //     console.log('err', err)
                    //     console.log('stdout', stdout)
                    //     console.log('stderr', stderr)
                    // }
                )
                const errors = []

                // child.stdin.pipe(process.stdin)
                // child.stdout.pipe(process.stdout)
                // child.stderr.pipe(process.stderr)
                const port = await waitForPort(child)
                child.stderr.on('data', err => {
                    errors.push(err)
                })

                // console.log({
                //     port,
                //     errors,
                // })
                expect(errors.length).toBe(0)

                await testPage(port)
                await terminate(child.pid)
            })
            test(`[Production] 使用 koot-start (--no-build) 命令启动服务器并访问 (自定义端口号)`, async () => {
                const port = '8316'
                const commandName = `${commandTestBuild}-isomorphic-start-server-custom-port`
                const command = `koot-start --no-build --port ${port}`
                await addCommand(commandName, command, dir)

                const child = execSync(
                    `npm run ${commandName}`,
                    {
                        cwd: dir,
                    },
                    // (err, stdout, stderr) => {
                    //     console.log('err', err)
                    //     console.log('stdout', stdout)
                    //     console.log('stderr', stderr)
                    // }
                )
                const errors = []

                // child.stdin.pipe(process.stdin)
                // child.stdout.pipe(process.stdout)
                // child.stderr.pipe(process.stderr)
                child.stderr.on('data', err => {
                    errors.push(err)
                })

                // console.log(111)
                await waitForPort(child)
                // console.log(222)

                // console.log({
                //     port,
                //     errors,
                // })
                expect(errors.length).toBe(0)

                await testPage(port)
                await terminate(child.pid)
            })
            test(`[Production] 使用打包后的执行文件启动服务器并访问`, async () => {
                const cwd = path.resolve(dir, 'dist')
                const child = execSync(
                    `node ${path.resolve(cwd, 'index.js')}`,
                    {
                        cwd,
                    },
                )
                const errors = []

                const port = await waitForPort(child)
                child.stderr.on('data', err => {
                    errors.push(err)
                })

                // console.log({
                //     port,
                //     errors,
                // })
                expect(errors.length).toBe(0)

                await testPage(port)
                await terminate(child.pid)
            })
            test(`[Development] 启动开发模式并访问`, async () => {
                // const port = '8316'
                const commandName = `${commandTestBuild}-isomorphic-dev`
                const command = `koot-dev --no-open`
                await addCommand(commandName, command, dir)

                const child = execSync(
                    `npm run ${commandName}`,
                    {
                        cwd: dir,
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

                await testPage(port)
                await terminate(child.pid)
            })

            // 移除临时项目配置文件
            await removeTempProjectConfig(dir)
        })
    }
})
