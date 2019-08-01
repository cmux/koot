// jest configuration
jest.setTimeout(5 * 60 * 1 * 1000);

//

const fs = require('fs-extra');
const path = require('path');
const execSync = require('child_process').exec;
const crawler = require('../crawler');
const waitForPort = require('../../../test/libs/get-port-from-child-process');
const terminate = require('../../../test/libs/terminate-process');

//

describe('koot-diagnose', () => {
    const dir = path.resolve(__dirname, './project-full-of-shits');

    test('crawler', async () => {
        const configFile = `koot.config.js`;
        const dist = path.resolve(dir, 'dist');
        if (fs.existsSync(dist)) fs.emptyDirSync(dist);
        else fs.removeSync(dist);

        const child = execSync(`npm run start`, {
            cwd: dir
        });
        const errors = [];

        await waitForPort(child);
        const port = require(path.resolve(dir, configFile)).port;
        child.stderr.on('data', err => {
            errors.push(err);
        });

        const crawlerResult = await crawler(`http://localhost:${port}`);
        // console.log(crawlerResult);

        const {
            'console error': consoleError,
            'broken request': brokenRequest,
            'large file': largeFile
        } = crawlerResult;

        await terminate(child.pid);

        expect(typeof crawlerResult).toBe('object');
        expect(Array.isArray(crawlerResult)).toBe(false);

        expect(Array.isArray(consoleError)).toBe(true);
        expect(
            consoleError.some(
                e =>
                    e instanceof Error &&
                    e.message &&
                    /\/this-is-a-non-exist-css-file\.css/.test(e.message)
            )
        ).toBe(true);
        expect(
            consoleError.some(
                e => e instanceof Error && e.message && /404/.test(e.message)
            )
        ).toBe(true);

        expect(Array.isArray(brokenRequest)).toBe(true);
        expect(
            brokenRequest.some(
                e =>
                    e instanceof Error &&
                    e.url &&
                    /\/this-is-a-non-exist-js-file\.js/.test(e.url)
            )
        ).toBe(true);
        expect(
            brokenRequest.some(
                e =>
                    e instanceof Error && e.url && /\/this-is-a-404/.test(e.url)
            )
        ).toBe(true);

        expect(Array.isArray(largeFile)).toBe(true);
        expect(
            largeFile.some(
                e =>
                    e instanceof Error &&
                    e.url &&
                    /\/this-is-a-large-file\.png/.test(e.url) &&
                    e.threshold < e.contentLength
            )
        ).toBe(true);
    });
});
