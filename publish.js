const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const inquirer = require('inquirer')
const { spawn } = require('child_process')

const run = async () => {

    console.log('\n' + chalk.cyanBright('Koot.js - Publish') + '\n')

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
    if (!selected.length) {
        console.log('No package selected. Aborted.')
        return
    }

    const { tag = [] } = await inquirer.prompt({
        type: 'list',
        name: 'tag',
        message: 'Select tag for NPM',
        choices: [
            {
                name: 'No tag (none)',
                value: ""
            },
            'next'
        ],
        default: 0,
    })

    const cmd = `lerna publish`
        + ` --ignore-changes "packages/!(${selected.join('|')})/**"`
        + (tag ? ` --dist-tag ${tag}` : '')

    const segs = cmd.split(' ')

    spawn(
        segs.shift(),
        segs,
        {
            stdio: 'inherit',
            shell: true,
        }
    )
}

run().catch(e => console.error(e))
