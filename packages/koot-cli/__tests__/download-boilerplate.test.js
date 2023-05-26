import { jest } from '@jest/globals';

import fs from 'fs-extra';
import path from 'node:path';
import url from 'node:url';
import os from 'node:os';
import { glob } from 'glob';

import downloadBoilerplate from '../steps/create/download-boilerplate.js';

jest.useFakeTimers();
jest.setTimeout(1 * 60 * 1000); // 1 mins

beforeAll(async () => {
    await import('./before.js').then((mod) => mod.default());
});

const dotFilesIgnore = ['.git', '.husky', '.cz-config.js'];

describe('测试: 下载模板', () => {
    test(`向已存在的目录中新建项目`, async () => {
        let error;

        const dirOriginal = url.fileURLToPath(
            new URL('../../koot-boilerplate', import.meta.url)
        );
        const target = path.resolve(os.tmpdir(), `koot-cli-test-${Date.now()}`);
        const readme = path.resolve(target, 'README.md');
        const readmeContent = `KOOT CLI TEST`;
        const junk = path.resolve(target, 'junk.junk');
        const junkContent = `KOOT CLI JUNK`;

        const dotFiles = (
            await glob('.*', {
                cwd: dirOriginal,
                dot: true,
            })
        )
            .filter((filename) => dotFilesIgnore.every((v) => filename !== v))
            .map((filename) => path.resolve(target, filename));

        await fs.ensureDir(target);
        await fs.emptyDir(target);
        await fs.writeFile(readme, readmeContent, 'utf-8');
        await fs.writeFile(junk, junkContent, 'utf-8');

        await downloadBoilerplate(target, 'base').catch((err) => (error = err));

        if (error) {
            await fs.remove(target);
            console.error(error);
            expect(typeof error).toBe('undefined');
            return;
        }

        const readmeExists = fs.existsSync(readme);
        const readmeNewContent = await fs.readFile(readme, 'utf-8');
        const junkExists = fs.existsSync(junk);
        const junkNewContent = await fs.readFile(junk, 'utf-8');
        const dotFilesExist = dotFiles.map((file) => ({
            file,
            exists: fs.existsSync(file),
        }));

        await fs.remove(target);

        expect(typeof error).toBe('undefined');
        expect(readmeExists).toBe(true);
        expect(readmeNewContent).not.toBe(readmeContent);
        expect(junkExists).toBe(true);
        expect(junkNewContent).toBe(junkContent);
        expect(dotFilesExist.every((v) => v.exists === true)).toBe(true);
    });
});
