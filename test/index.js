const inquirer = require('inquirer')

const runScript = require('../libs/run-script')
const logWelcome = require('../libs/log/welcome')
const logFinish = require('../libs/log/finish')

const run = async () => {

    logWelcome('Test')

    const jestScript = {
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
                name: 'React - Only Isomorphic',
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

        if (value === 'FULL')
            return [
                `node ./test/pre-test.js`,
                `jest "^((?!need-in-order).)*\\.js$"`,
                `jest ${jestScript.reactSPA}`,
                `jest ${jestScript.reactIsomorphic}`
            ].join(' && ')

        if (value === 'FULL-QUICK')
            return [
                `jest "^((?!need-in-order).)*\\.js$"`,
                `jest ${jestScript.reactSPA}`,
                `jest ${jestScript.reactIsomorphic}`
            ].join(' && ')

        if (value === 'REACT')
            return [
                `jest ${jestScript.reactSPA}`,
                `jest ${jestScript.reactIsomorphic}`
            ].join(' && ')

        return `jest ${value}`

    })()

    await runScript(script)

    logFinish()
}

run()
