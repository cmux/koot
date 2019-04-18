const fs = require('fs-extra')
const path = require('path')
const inquirer = require('inquirer')
const crlf = require('crlf')

const runScript = require('./libs/run-script')
const logWelcome = require('./libs/log/welcome')
const logAbort = require('./libs/log/abort')
const logFinish = require('./libs/log/finish')

const filesChangedFromCRLFtoLF = []

const prePublish = async () => {
    const dirKoot = path.resolve(__dirname, './packages/koot')
    const { bin } = await fs.readJson(path.resolve(dirKoot, 'package.json'))
    for (const pathname of bin) {
        const file = path.resolve(dirKoot, pathname)
        await new Promise((resolve, reject) => {
            crlf.set(file, 'LF', (err, endingType) => {
                if (err) return reject(err)
                if (endingType === 'CRLF')
                    filesChangedFromCRLFtoLF.push(file)
                resolve(endingType)
            })
        })
    }
}

const postPublish = async () => {
    for (const file of filesChangedFromCRLFtoLF) {
        await new Promise((resolve, reject) => {
            crlf.set(file, 'CRLF', (err) => {
                if (err) return reject(err)
                resolve()
            })
        })
    }
}

const run = async () => {

    logWelcome('Publish')

    const defaultSelected = [
        // 'koot',
        // 'koot-webpack'
    ]

    const dirPackages = path.resolve(__dirname, './packages')
    const packages = (await fs.readdir(dirPackages))
        .filter(filename => {
            const dir = path.resolve(dirPackages, filename)
            const lstat = fs.lstatSync(dir)
            if (!lstat.isDirectory())
                return false

            // 检查 package.json
            const filePackage = path.resolve(dir, 'package.json')
            if (!fs.existsSync(filePackage))
                return false

            let p
            try {
                p = fs.readJsonSync(filePackage)
            } catch (e) { }

            if (typeof p !== 'object')
                return false

            if (p.private)
                return false

            return true
        })

    const { selected = [] } = await inquirer.prompt({
        type: 'checkbox',
        name: 'selected',
        message: 'Select package(s) to publish\n ',
        choices: packages,
        default: defaultSelected,
    })
    console.log('')
    if (!selected.length) {
        logAbort('No package selected.')
        return
    }

    const { tag = false } = await inquirer.prompt({
        type: 'list',
        name: 'tag',
        message: 'Select tag for NPM',
        choices: [
            {
                name: 'Please select a tag',
                value: false
            },
            {
                name: 'No tag (none)',
                value: ""
            },
            'next'
        ],
        default: 0,
    })
    console.log('')
    if (tag === false) {
        logAbort('No tag selected.')
        return
    }

    await prePublish()
    await runScript(
        `lerna publish`
        + ` --ignore-changes "packages/!(${selected.join('|')})/**"`
        + (tag ? ` --dist-tag ${tag}` : '')
    )
    await postPublish()

    logFinish()
}

run()
    .catch(async e => {
        console.error(e)
        await postPublish()
    })
