const fs = require('fs-extra');
const path = require('path');
const inquirer = require('inquirer');
const crlf = require('crlf');
const glob = require('glob-promise');

const runScript = require('./libs/run-script');
const logWelcome = require('./libs/log/welcome');
const logAbort = require('./libs/log/abort');
const logFinish = require('./libs/log/finish');
const spinner = require('./packages/koot/utils/spinner');

const prePublish = async () => {
    const title = 'pre-publish';
    const waiting = spinner(title + '...');

    const packages = await glob(
        path.resolve(__dirname, 'packages/*/package.json')
    );
    const bins = [];

    // 汇总所有 bin 文件
    for (const packageJson of packages) {
        const dir = path.dirname(packageJson);
        const { bin = {} } = await fs.readJson(packageJson);
        for (const pathname of Object.values(bin)) {
            bins.push(path.resolve(dir, pathname));
        }
    }

    // 将所有 bin 文件的换行符改为 LF
    for (const file of bins) {
        await new Promise((resolve, reject) => {
            crlf.set(file, 'LF', (err, endingType) => {
                if (err) return reject(err);
                resolve(endingType);
            });
        });
    }

    // git commit
    const git = require('simple-git/promise')(__dirname);
    const complete = () => {
        waiting.stop();
        spinner(title).succeed();
        console.log(' ');
    };
    try {
        const { modified = [] } = await git.status();
        if (modified.length) {
            await git.add('./*');
            await git.commit(`changed all bins' line breaks to LF`);
        }
        complete();
    } catch (e) {
        if (e.message === 'No staged files match any of provided globs.')
            complete();
        else console.error(e);
    }
};

const run = async () => {
    logWelcome('Publish');

    const defaultSelected = [
        // 'koot',
        // 'koot-webpack'
    ];

    const dirPackages = path.resolve(__dirname, './packages');
    const packages = (await fs.readdir(dirPackages)).filter(filename => {
        const dir = path.resolve(dirPackages, filename);
        const lstat = fs.lstatSync(dir);
        if (!lstat.isDirectory()) return false;

        // 检查 package.json
        const filePackage = path.resolve(dir, 'package.json');
        if (!fs.existsSync(filePackage)) return false;

        let p;
        try {
            p = fs.readJsonSync(filePackage);
        } catch (e) {}

        if (typeof p !== 'object') return false;

        if (p.private) return false;

        return true;
    });

    const { selected = [] } = await inquirer.prompt({
        type: 'checkbox',
        name: 'selected',
        message: 'Select package(s) to publish\n ',
        choices: packages,
        default: defaultSelected
    });
    console.log('');
    if (!selected.length) {
        logAbort('No package selected.');
        return;
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
                value: ''
            },
            'next'
        ],
        default: 0
    });
    console.log('');
    if (tag === false) {
        logAbort('No tag selected.');
        return;
    }

    await prePublish();
    await runScript(
        `lerna publish` +
            ` --ignore-changes "packages/!(${selected.join('|')})/**"` +
            (tag ? ` --dist-tag ${tag}` : '')
    );

    logFinish();
};

run().catch(async e => console.error(e));
