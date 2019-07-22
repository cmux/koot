// jest configuration
jest.setTimeout(5 * 60 * 1 * 1000);

//

const fs = require('fs-extra');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const execSync = require('child_process').exec;
// const chalk = require('chalk')
const JSDOM = require('jsdom').JSDOM;
const puppeteer = require('puppeteer');
const chalk = require('chalk');

//

const {
    chunkNameExtractCss,
    chunkNameExtractCssForImport
} = require('koot/defaults/before-build');
const terminate = require('../../libs/terminate-process');
const waitForPort = require('../../libs/get-port-from-child-process');
const testHtmlRenderedByKoot = require('../../general-tests/html/rendered-by-koot');
const testFilesFromChunkmap = require('../../general-tests/bundle/check-files-from-chunkmap');
const {
    requestHidden404: testRequestHidden404,
    criticalAssetsShouldBeGzip: testAssetsGzip
} = require('../puppeteer-test');

//

const removeTempProjectConfig = require('../../../packages/koot/libs/remove-temp-project-config');
const sleep = require('../../../packages/koot/utils/sleep');

//

const projects = require('../../projects/get')();

const projectsToUse = projects.filter(
    project =>
        // Array.isArray(project.type) && project.type.includes('react-isomorphic')
        project.name === 'standard'
);
const commandTestBuild = 'koot-buildtest';

//

//

/**
 * 向 package.json 里添加 npm 命令
 * @async
 * @param {String} name
 * @param {String} command
 * @param {String} cwd
 */
const addCommand = async (name, command, cwd) => {
    const pathPackage = path.resolve(cwd, 'package.json');
    const p = await fs.readJson(pathPackage);
    // if (!p.scripts[name])
    p.scripts[name] = command;
    await fs.writeJson(pathPackage, p, {
        spaces: 4
    });
};

/**
 * 测试项目开始前
 * @async
 * @param {String} cpd Current Project Directory
 * @param {String} dist
 */
const beforeTest = async cpd => {
    await removeTempProjectConfig(cpd);
};

/**
 * 测试项目结束后
 * @async
 * @param {String} cpd Current Project Directory
 * @param {String} dist
 * @param {String} title
 */
const afterTest = async (cpd /*, title*/) => {
    await sleep(2 * 1000);
    await removeTempProjectConfig(cpd);

    // console.log(chalk.green('√ ') + title)
};

//

const testFull = (dir, configFileName) => {
    const start = Date.now();
    const forceChangeType = !configFileName;
    const fileKootConfig = path.resolve(
        dir,
        configFileName || 'koot.config.js'
    );

    return describe(`配置文件: ${configFileName || '默认'}`, () => {
        const config = require(fileKootConfig);
        const dest = forceChangeType ? 'dist-spa-test' : config.dist;
        const dist = path.resolve(dir, dest);

        const fileIndexHtml = path.resolve(dist, 'index.html');

        if (fs.existsSync(dist)) fs.emptyDirSync(dist);
        else fs.removeSync(dist);

        test(`使用 koot-build 命令进行生产模式打包，打包应该成功`, async () => {
            await beforeTest(dir);

            const commandName = `${commandTestBuild}-spa-build-config-${
                configFileName ? configFileName.replace(/\./g, '_') : 'default'
            }`;
            const command =
                `koot-build --koot-test` +
                (forceChangeType
                    ? ` --type react-spa --dest ${dest}`
                    : ` --config ${fileKootConfig}`);
            await addCommand(commandName, command, dir);

            // console.log(commandName)
            const { /*stdout,*/ stderr } = await exec(
                `npm run ${commandName}`,
                {
                    cwd: dir
                }
            );

            // console.log(stderr)

            expect(typeof stderr).toBe('string');
            expect(stderr).toBe('');

            await afterTest(dir, '[Production] 使用 koot-build 命令进行打包');
        });

        test(`打包完成后，index.html 与相应的静态资源文件应该存在，且内容应该正确`, async () => {
            // chunkmap
            const fileChunkmap = path.resolve(dist, '.public-chunkmap.json');
            expect(fs.existsSync(fileChunkmap)).toBe(true);

            const chunkmap = fs.readJsonSync(fileChunkmap);
            expect(typeof chunkmap).toBe('object');

            const { '.files': files } = chunkmap;
            expect(typeof files).toBe('object');

            // 根据 key 测试 chunkmap 中的文件
            const testFileFromFilelist = key => {
                const pathname = files[key];
                expect(typeof pathname).toBe('string');

                const file = path.resolve(dist, pathname);
                expect(fs.existsSync(file)).toBe(true);
            };

            // 测试文件: /index.html
            {
                expect(fs.existsSync(fileIndexHtml)).toBe(true);

                const content = fs.readFileSync(fileIndexHtml);
                const dom = new JSDOM(content);
                const config = require(path.resolve(dir, 'koot.config.js'));
                const chunkmap = fs.readJsonSync(
                    require('../../../packages/koot/utils/get-chunkmap-path')(
                        dist
                    )
                );

                expect(
                    dom.window.document.querySelector('title').textContent
                ).toBe(config.name);

                // 测试: HTML 注入 (动态)
                const checkFilename = 'specialEntry.js';
                const checkString =
                    `<!--:::KOOT:::TEST:::` +
                    chunkmap['.files'][checkFilename] +
                    fs.readFileSync(
                        path.resolve(dist, chunkmap['.files'][checkFilename]),
                        'utf-8'
                    ) +
                    `-->`;
                expect(content.includes(checkString)).toBe(true);

                await testHtmlRenderedByKoot(content);
            }

            // 测试文件: 全局 CSS
            testFileFromFilelist(chunkNameExtractCss + '.css');
            testFileFromFilelist(chunkNameExtractCssForImport + '.css');

            await testFilesFromChunkmap(dist);

            // TODO: 测试: 有 extract.all.[*].css
        });

        test(`[prod] 简易服务器可用`, async () => {
            const fileServerJS = path.resolve(dist, './.server/index.js');
            expect(fs.existsSync(fileServerJS)).toBe(true);

            const port = config.port;
            const errors = [];

            const browser = await puppeteer.launch({
                headless: true
            });
            const context = await browser.createIncognitoBrowserContext();

            const testSpaServer = async cwd => {
                // console.log({
                //     command: `node ${fileServerJS}`,
                //     cwd
                // });
                const child = execSync(`node ${fileServerJS}`, {
                    cwd
                });
                const errors = [];
                child.stderr.on('data', err => {
                    errors.push(err);
                });

                await waitForPort(child);

                const origin = isNaN(port) ? port : `http://127.0.0.1:${port}`;
                const context = await browser.createIncognitoBrowserContext();

                const page = await context.newPage();
                const failedResponse = [];
                require('../../libs/puppeteer/page-event-response-failed-response')(
                    page,
                    failedResponse
                );

                const res = await page.goto(origin, {
                    waitUntil: 'networkidle0'
                });
                const html = await res.text();

                // 测试: 没有失败的请求
                if (failedResponse.length) {
                    console.log(
                        'failedResponse',
                        failedResponse.map(res => ({
                            status: res.status(),
                            url: res.url()
                        }))
                    );
                }
                expect(failedResponse.length).toBe(0);
                expect(errors.length).toBe(0);

                await testHtmlRenderedByKoot(html);
                await testRequestHidden404(origin, browser);
                await testAssetsGzip(origin, dist, browser);

                // 结束测试
                await page.close();
                await terminate(child.pid);
            };

            await testSpaServer(dir).catch(e => {
                errors.push(e);
            });
            await testSpaServer(dist).catch(e => {
                errors.push(e);
            });

            // TODO: 在设置了 sw 时有 sw 注册且没有报错

            await context.close();
            await browser.close();

            if (errors.length) {
                errors.forEach(e => console.error(e));
            }

            expect(errors.length).toBe(0);

            if (fs.existsSync(dist)) fs.removeSync(dist);

            console.log(
                chalk.green('√ ') +
                    chalk.green(`${(Date.now() - start) / 1000}s `) +
                    configFileName
            );
        });

        // TODO: 测试: 所有 Webpack 结果资源的访问

        // TODO: 测试: extend connect 的 Array 用法
    });
};

describe('测试: React SPA 项目', () => {
    for (const project of projectsToUse) {
        const { name, dir } = project;
        describe(`项目: ${name}`, () => {
            testFull(dir);
            testFull(dir, 'koot.build.spa-1.js');
            testFull(dir, 'koot.build.spa-2.js');
        });
    }
});

// TODO: 开发环境

/** TODO: 热更新测试
 * - 修改 ejs
 * - 修改 css
 * - 修改 react 组件
 * - 修改 extend 传入信息
 */
