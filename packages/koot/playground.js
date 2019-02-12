const fs = require('fs-extra')
const path = require('path')
// const util = require('util')
const exec = require('child_process').exec
const puppeteer = require('puppeteer')
// const npmRunScript = require('npm-run-script')
const terminate = require('terminate')

//

const dirProjects = path.resolve(__dirname, '.projects')
const project = {
    name: 'koot-boilerplate',
    github: 'cmux/koot-boilerplate',
    type: [
        'react-isomorphic',
        'react-spa'
    ]
}

//

// const getPort = require('./utils/get-port')
const getPathnameDevServerStart = require('./utils/get-pathname-dev-server-start')
const checkFileChange = require('./libs/check-file-change')

//

global.kootTest = true
process.env.KOOT_TEST_MODE = JSON.stringify(true)

//

const addCommand = async (name, command, dir) => {
    const pathPackage = path.resolve(dir, 'package.json')
    const p = await fs.readJson(pathPackage)
    if (!p.scripts[name])
        p.scripts[name] = command
    await fs.writeJson(pathPackage, p, {
        spaces: 4
    })
}

const { name } = project
const dir = path.resolve(dirProjects, name)

const run = async () => {
    // const commandName = `koot-buildtest-isomorphic-start-server`
    // const command = `koot-start --no-build`
    // await addCommand(commandName, command, dir)

    const child = exec(
        `npm run dev:no-open`,
        {
            cwd: dir,
            // detached: true,
        }
    )
    const errors = []

    // child.stdin.pipe(process.stdin)
    // child.stdout.pipe(process.stdout)
    // child.stderr.pipe(process.stderr)
    const port = await new Promise(resolve => {
        let port
        child.stdout.on('data', msg => {
            console.log(msg)
            try {
                const obj = JSON.parse(msg)
                if (obj['koot-test']) {
                    port = obj.port
                }
            } catch (e) { }

            if (!port) {
                // const matches = /port.*\[32m([0-9]+)/.exec(msg)
                const matches = / on.*http:.*:([0-9]+)/.exec(msg)
                if (Array.isArray(matches) && matches.length > 1) {
                    port = parseInt(matches[1])
                }
            }

            if (port)
                return resolve(port)
        })
    })
    child.stderr.on('data', err => {
        errors.push(err)
    })

    // console.log({
    //     port,
    //     errors,
    // })

    // child.on('message', (message, sendHandle) => {
    //     console.log(message, sendHandle)
    // })
    // child.on('error', (error) => {
    //     console.log(error)
    // })
    // child.on('close', (code, signal) => {
    //     console.log(code, signal)
    // })

    // console.log(process)
    // setTimeout(() => {
    //     // console.log(process)
    //     process.kill('SIGINT')
    // }, 5 * 1000)

    // console.log(stdout)

    const browser = await puppeteer.launch({
        headless: false
    })

    // 访问首页
    const page = await browser.newPage()
    const res = await page.goto(`http://127.0.0.1:${port}`, {
        waitUntil: 'networkidle0'
    })
    // const isOK = res.ok()
    // const body = await res.text()
    // console.log({
    //     url: res.url(),
    //     status: res.status(),
    //     ok: res.ok(),
    //     headers: res.headers(),
    //     body: await res.text()
    // })
    // const elTitle = await page.$('title')
    const pageTitle = await page.evaluate(() => document.querySelector('title').innerText)
    // const elApp = await page.evaluate(() => document.querySelector('#app'))
    console.log('pageTitle', pageTitle)
    // console.log(elApp)
    // console.log(await page.$('#aapp'))
    const localeId = await page.evaluate(() => document.querySelector('meta[name="koot-locale-id"]').getAttribute('content'))
    console.log('localeId', localeId)

    const linksToOtherLang = await page.$$eval(`link[rel="alternate"][hreflang][href]:not([hreflang="${localeId}"])`, els => (
        Array.from(els).map(el => ({
            lang: el.getAttribute('hreflang'),
            href: el.getAttribute('href')
        }))
    ))
    console.log(linksToOtherLang)
    for (let { lang, href } of linksToOtherLang) {
        await page.goto(href, {
            waitUntil: 'networkidle0'
        })
        const localeId = await page.evaluate(() => document.querySelector('meta[name="koot-locale-id"]').getAttribute('content'))
        console.log(lang, localeId)
    }

    await browser.close()

    // expect(typeof stderr).toBe('string')
    // expect(stderr).toBe('')

    terminate(child.pid)
}

run()
