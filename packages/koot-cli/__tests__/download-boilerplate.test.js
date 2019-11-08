// jest configuration
jest.setTimeout(5 * 60 * 1 * 1000); // 5mins

const fs = require('fs-extra');
const path = require('path');
const os = require('os');

const downloadBoilerplate = require('../steps/create/download-boilerplate');

beforeAll(async () => {
    // await require('./before')();
});

describe('测试: 下载模板', () => {
    test(`向已存在的目录中新建项目`, async () => {
        let error;

        const target = path.resolve(os.tmpdir(), `koot-cli-test-${Date.now()}`);
        const readme = path.resolve(target, 'README.md');
        const readmeContent = `KOOT CLI TEST`;
        const junk = path.resolve(target, 'junk.junk');
        const junkContent = `KOOT CLI JUNK`;

        await fs.ensureDir(target);
        await fs.emptyDir(target);
        await fs.writeFile(readme, readmeContent, 'utf-8');
        await fs.writeFile(junk, junkContent, 'utf-8');

        await downloadBoilerplate({}, target).catch(err => (error = err));

        const readmeExists = fs.existsSync(readme);
        const readmeNewContent = await fs.readFile(readme, 'utf-8');
        const junkExists = fs.existsSync(junk);
        const junkNewContent = await fs.readFile(junk, 'utf-8');

        await fs.remove(target);

        expect(typeof error).toBe('undefined');
        expect(readmeExists).toBe(true);
        expect(readmeNewContent).not.toBe(readmeContent);
        expect(junkExists).toBe(true);
        expect(junkNewContent).toBe(junkContent);
    });
});
