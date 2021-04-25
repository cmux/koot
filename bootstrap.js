/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');

// const ignore = "koot-@(cli|boilerplate|boilerplate-*)"
const individualPackages = ['create-koot-app', 'koot-cli'];
const ignore =
    '@(' +
    [
        ...[
            'boilerplate',
            'boilerplate-legacy',
            'boilerplate-system',
            'boilerplate-web',
        ].map((name) => `koot-${name}`),
        ...individualPackages,
    ].join('|') +
    ')';

const runCmd = async (msg, cmd, options = {}) => {
    if (!cmd || typeof cmd === 'object') return await runCmd(cmd, cmd, options);

    // print name
    console.log('\n');
    console.log(`\x1b[43m \x1b[0m\x1b[33m ` + msg + `\x1b[0m`);
    console.log('');

    // spawn
    const chunks = cmd.split(' ');
    await new Promise((resolve) => {
        const child = require('child_process').spawn(chunks.shift(), chunks, {
            stdio: 'inherit',
            shell: true,
            ...options,
        });
        child.on('close', () => {
            resolve();
        });
    });
};

async function prepareIndividualPackage(pName) {
    const cwd = path.resolve(__dirname, './packages', pName);

    if (!fs.existsSync(cwd)) return;

    await runCmd(
        `Install deps for ${pName}`,
        `npm install --no-package-lock"`,
        {
            cwd,
        }
    );
}

const run = async () => {
    // 检查 `lerna` 是否安装到本地依赖
    const lernaInstalled = fs.existsSync(
        path.resolve(__dirname, 'node_modules/lerna')
    );

    if (lernaInstalled) {
        await runCmd(
            `Run: lerna clean`,
            `lerna clean --yes --ignore "${ignore}"`
        );
    }
    await runCmd(
        `Install deps for root directory`,
        'npm install --no-package-lock'
    );
    await runCmd(
        `Run: lerna bootstrap`,
        `lerna bootstrap --hoist --ignore "${ignore}"`
    );
    for (const pName of individualPackages) {
        await prepareIndividualPackage(pName);
    }
    await runCmd(`Install deps for test projects`, `node test/pre-test.js"`);

    //

    console.log('\n');
    console.log(`\x1b[42m \x1b[0m\x1b[32m Bootstrap complete\x1b[0m`);
    console.log('');
};

run().catch((err) => console.error(err));
