jest.setTimeout(15 * 60 * 1 * 1000);

const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');

const envKey = '__KOOT_TEST_BUILD_CACHE__';
const elId = '__koot-test-build-cache';
const projectDir = path.resolve(__dirname, '../projects/standard');
const cacheFolder = path.resolve(projectDir, 'node_modules/.cache');
const sleep = require('../../packages/koot/utils/sleep');
// const cacheName = 'default-production';

const maxPhaseCount = 3;

// ============================================================================

/*
2021/1/18
-  改为使用 Webpack 5 内置的缓存机制，不再对缓存目录数目进行检测，只检测是否存在缓存目录
 */

// ============================================================================

/**
 * 以当前时间戳为此次测试的所有打包流程添加环境变量，确保不使用原有缓存
 * 1. 进行一次打包，判断是否生成了新的缓存，并判断 index.html 中是否有上述时间戳特征，并记录此次打包总耗时
 * 2. 再进行一次打包，检查是否没有生成新的缓存，检查打包耗时是否较上次短
 * @param {*} options
 */
const doTest = (options = {}) => {
    // const getCountInCacheFolder = () =>
    //     fs.existsSync(cacheFolder) ? fs.readdirSync(cacheFolder).length : 0;

    async function run(cacheValue) {
        const dist = path.resolve(projectDir, 'dist-spa');
        const file = path.resolve(dist, 'index.html');
        let timeFirstBuild;

        await sleep(500);
        await fs.ensureDir(cacheFolder);
        await fs.remove(cacheFolder);

        async function runSingleBuild(phaseCount = 1) {
            const timeStart = Date.now();

            await fs.ensureDir(dist);
            await fs.remove(dist);

            // const countFoldersInCacheBefore = getCountInCacheFolder();
            const command = `npm run build:spa -- ${envKey}=${cacheValue}`;

            // console.log(timeStart, command);
            await spawn(command, {
                cwd: projectDir,
                stdio: 'ignore',
                // stdio: 'inherit',
            });

            await waitUntil(() => {
                return (
                    fs.existsSync(file) &&
                    fs.readFileSync(file, 'utf-8').length > 0
                );
            });
            // console.log(fs.readFileSync(file, 'utf-8'));

            // console.log(phaseCount, Date.now() - timeStart, timeFirstBuild);
            if (phaseCount === 1) {
                // 第一次打包
                // 检查：生成了新的缓存目录
                timeFirstBuild = Date.now() - timeStart;
                // expect(getCountInCacheFolder() - countFoldersInCacheBefore).toBe(1);
            } else {
                // 后续打包
                // 检查：耗时更少
                // 检查：没有生成新缓存目录
                expect(Date.now() - timeStart < timeFirstBuild).toBe(true);
                // expect(getCountInCacheFolder() - countFoldersInCacheBefore).toBe(0);
            }

            // 通用
            // 检查：打包结果有变化的特征值
            const HTML = await fs.readFile(file);
            const $ = cheerio.load(HTML);
            expect($(`#${elId}`).text().trim()).toBe('' + cacheValue);

            if (phaseCount < maxPhaseCount)
                await runSingleBuild(phaseCount + 1);
        }

        await runSingleBuild();
    }

    return test(`_`, async () => {
        const now = Date.now();

        await run(now);
        await run(now + 10);
    });
};

describe('测试: 打包缓存', () => {
    doTest({ cacheValue: Date.now() });
    // doTest({ cacheValue: Date.now() + 10 });
});

// ============================================================================

const spawn = async (cmd, options = {}) => {
    const chunks = cmd.split(' ');

    return new Promise((resolve, reject) => {
        const child = require('child_process').spawn(chunks.shift(), chunks, {
            stdio: 'inherit',
            shell: true,
            cwd: process.cwd(),
            ...options,
        });
        if (options.stdio === 'pipe') {
            child.stdout.pipe(process.stdin);
        }

        child.on('close', () => {
            resolve();
        });
        child.on('error', (...args) => {
            reject(...args);
        });
    }).catch((e) => {
        throw e;
    });
};

function waitUntil(func, polling = 100) {
    if (func()) return;

    return new Promise((resolve) => {
        waitUntil.interval = setInterval(() => {
            if (func()) {
                clearInterval(waitUntil.interval);
                resolve();
            }
        }, polling);
    });
}
