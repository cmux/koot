/* eslint-disable no-console */
const inquirer = require('inquirer');

const runScript = require('../libs/run-script');
const logWelcome = require('../libs/log/welcome');
const logFinish = require('../libs/log/finish');
// const terminate = require('./libs/terminate-process');

const run = async () => {
    logWelcome('Test');

    const jestScript = {
        reactBase: `./test/cases/react-base`,
        reactIsomorphic: `./test/cases/react-isomorphic`,
        reactSPA: `./test/cases/react-spa`,
        cli: {
            all: './packages/koot-cli/__tests__/.+\\.test\\.[jt]sx?$',
        },
    };

    const { value } = await inquirer.prompt({
        type: 'list',
        name: 'value',
        message: 'Select test set',
        choices: [
            {
                name: 'Full',
                value: 'FULL',
            },
            {
                name: 'Full (donot init test projects)',
                value: 'FULL-QUICK',
            },
            new inquirer.Separator(),
            {
                name: 'React - Full',
                value: 'REACT',
            },
            {
                name: 'React - Only Base',
                value: jestScript.reactBase,
            },
            {
                name: 'React - Only SSR',
                value: jestScript.reactIsomorphic,
            },
            {
                name: 'React - Only SPA',
                value: jestScript.reactSPA,
            },
            new inquirer.Separator(),
            {
                name: 'Package: koot-cli',
                value: jestScript.cli.all,
            },
            new inquirer.Separator(),
            {
                name: 'Lib: validate-pathname',
                value: './test/cases/libs/validate-pathname',
            },
            {
                name: 'Lib: validate-config',
                value: './test/cases/.+/validate-config',
            },
            {
                name: 'Lib: koot-css-loader',
                value: './test/cases/libs/koot-css-loader',
            },
            new inquirer.Separator(),
            {
                name: 'Functions: koot/i18n',
                value: './test/cases/i18n',
            },
            new inquirer.Separator(),
            {
                name: 'Suite: Build Cache',
                value: './test/cases/build-cache',
            },
            new inquirer.Separator(),
        ],
        default: 'full',
    });

    console.log('');

    const script = (() => {
        const jestReactAll = [
            `jest ${jestScript.reactBase}`,
            `jest ${jestScript.reactSPA}`,
            `jest ${jestScript.reactIsomorphic}`,
        ];

        const jestAll = [
            `jest "test/((?!need-in-order).)*\\.test\\.[jt]sx?$"`,
            `jest ${jestScript.cli.all}`,
            ...jestReactAll,
        ];

        if (value === 'FULL')
            return [`node ./test/pre-test.js`, ...jestAll].join(' && ');

        if (value === 'FULL-QUICK') return [...jestAll].join(' && ');

        if (value === 'REACT') return [...jestReactAll].join(' && ');

        return `jest ${value}`;
    })();

    await runScript(script);

    logFinish();

    // throw new Error('Force terminate process');
};

run();
