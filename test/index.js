const inquirer = require('inquirer')

const runScript = require('../libs/run-script')
const logWelcome = require('../libs/log/welcome')
const logFinish = require('../libs/log/finish')

const run = async () => {

    logWelcome('Test')

    const jestScript = {
        reactBase: `./test/cases/react-base`,
        reactIsomorphic: `./test/cases/react-isomorphic`,
        reactSPA: `./test/cases/react-spa`
    }

    const { value } = await inquirer.prompt({
        type: 'list',
        name: 'value',
        message: 'Select test set',
        choices: [
            {
                name: 'Full',
                value: 'FULL'
            },
            {
                name: 'Full (donot init test projects)',
                value: 'FULL-QUICK'
            },
            new inquirer.Separator(),
            {
                name: 'React - Full',
                value: 'REACT'
            },
            {
                name: 'React - Only Base',
                value: jestScript.reactBase
            },
            {
                name: 'React - Only SSR',
                value: jestScript.reactIsomorphic
            },
            {
                name: 'React - Only SPA',
                value: jestScript.reactSPA
            },
            new inquirer.Separator(),
            {
                name: 'Package: koot-cli',
                value: './test/cases/package/cli'
            },
            new inquirer.Separator(),
            {
                name: 'Lib: validate-pathname',
                value: './test/cases/libs/validate-pathname'
            },
            {
                name: 'Lib: validate-config',
                value: './test/cases/.+/validate-config'
            },
            new inquirer.Separator(),
        ],
        default: 'full',
    })

    console.log('')

    const script = (() => {

        const jestReactAll = [
            `jest ${jestScript.reactBase}`,
            `jest ${jestScript.reactSPA}`,
            `jest ${jestScript.reactIsomorphic}`
        ]

        if (value === 'FULL')
            return [
                `node ./test/pre-test.js`,
                `jest "^((?!need-in-order).)*\\.js$"`,
                ...jestReactAll
            ].join(' && ')

        if (value === 'FULL-QUICK')
            return [
                `jest "^((?!need-in-order).)*\\.js$"`,
                ...jestReactAll
            ].join(' && ')

        if (value === 'REACT')
            return [
                ...jestReactAll
            ].join(' && ')

        return `jest ${value}`

    })()

    await runScript(script)

    logFinish()
}

run()
