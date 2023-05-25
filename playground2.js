import fs from 'fs-extra';
import path from 'node:path';
import url from 'node:url';
import os from 'node:os';
import { glob } from 'glob';

import ensureLocales from './packages/koot-cli/lib/ensure-locales.js';
import downloadBoilerplate from './packages/koot-cli/steps/create/download-boilerplate.js';

const dotFilesIgnore = ['.git', '.husky', '.cz-config.js'];

async function run() {
    ensureLocales();

    let error;

    const dirOriginal = url.fileURLToPath(
        new URL('./packages/koot-boilerplate', import.meta.url)
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
        // expect(typeof error).toBe('undefined');
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

    console.log({
        1: typeof error,
        2: readmeExists,
        3: readmeNewContent !== readmeContent,
        4: junkExists,
        5: junkNewContent === junkContent,
        6: dotFilesExist,
    });
}

run();
