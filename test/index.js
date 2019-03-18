const chalk = require('chalk')
const inquirer = require('inquirer')
const { spawn } = require('child_process')

const run = async () => {

    console.log('\n' + chalk.cyanBright('Koot.js - Test'))

    const { value } = await inquirer.prompt({
        type: 'list',
        name: 'value',
        message: 'Select test set',
        choices: [
            {
                name: 'Full',
                value: 'full'
            },
            new inquirer.Separator(),
            {
                name: 'React - Full',
                value: 'react'
            },
            {
                name: 'React - Only Isomorphic',
                value: 'react:isomorphic'
            },
            {
                name: 'React - Only SPA',
                value: 'react:spa'
            },
            new inquirer.Separator(),
            {
                name: 'Lib: validate-pathname',
                value: 'libs:validate-pathname'
            },
            {
                name: 'Lib: validate-config',
                value: 'libs:validate-config'
            },
        ],
        default: 'full',
    })

    spawn(
        'npm',
        ['run', `test:${value}`],
        {
            stdio: 'inherit',
            shell: true,
        }
    )
}

run()
