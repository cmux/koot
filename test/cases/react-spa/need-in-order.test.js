/* eslint-disable no-console */
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
const postcss = require('postcss');

//

const {
    chunkNameExtractCss,
    chunkNameExtractCssForImport,
    buildManifestFilename,
} = require('koot/defaults/before-build');
const terminate = require('../../libs/terminate-process');
const waitForPort = require('../../libs/get-port-from-child-process');
const testHtmlRenderedByKoot = require('../../general-tests/html/rendered-by-koot');
const testFilesFromChunkmap = require('../../general-tests/bundle/check-files-from-chunkmap');
const checkDistRootFiles = require('../../general-tests/check-dist-root-files');
const testHtmlWebAppMetaTags = require('../../general-tests/html/web-app-meta-tags');
const {
    requestHidden404: testRequestHidden404,
    criticalAssetsShouldBeGzip: testAssetsGzip,
    clientLifecycles: testClientLifecycles,
    i18n: testI18n,
} = require('../puppeteer-test');

//

const removeTempProjectConfig = require('../../../packages/koot/libs/remove-temp-project-config');
const sleep = require('../../../packages/koot/utils/sleep');
const postcssTransformDeclUrls = require('../../../packages/koot-webpack/postcss/transform-decl-urls');
// const validateConfig = require('../../../packages/koot/libs/validate-config');

//

const projects = require('../../projects/get')();

const projectsToUse = projects.filter(
    (project) =>
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
        spaces: 4,
    });
};

/**
 * 测试项目开始前
 * @async
 * @param {String} cpd Current Project Directory
 * @param {String} dist
 */
const beforeTest = async (cpd) => {
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
    const fileKootConfigRel = path.relative(dir, fileKootConfig);

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
                    : ` --config ${fileKootConfigRel}`);
            await addCommand(commandName, command, dir);

            // console.log(commandName)
            const { /*stdout,*/ stderr } = await exec(
                `npm run ${commandName}`,
                {
                    cwd: dir,
                }
            );

            // console.log(stderr)

            expect(typeof stderr).toBe('string');
            expect(
                stderr
                    .replace(
                        /\(node:([0-9]+?)\) Warning: No such label 'URL' for console.timeEnd\(\)/g,
                        ''
                    )
                    .replace(
                        /\*\* \(sharp:([0-9]+?)\): WARNING \*\*: ([0-9:.]+?): jpegsave_buffer: no property named `subsample_mode'/g,
                        ''
                    )
                    .replace(/\r/g, '')
                    .replace(/\n/g, '')
            ).toBe('');

            await afterTest(dir, '[Production] 使用 koot-build 命令进行打包');
        });

        test(`打包完成后，index.html 与相应的静态资源文件应该存在，且内容应该正确`, async () => {
            // const config = await validateConfig(dir, {
            //     configFilename: fileKootConfig,
            // });

            // chunkmap
            const fileChunkmap = path.resolve(dist, buildManifestFilename);
            expect(fs.existsSync(fileChunkmap)).toBe(true);

            const chunkmap = fs.readJsonSync(fileChunkmap);
            expect(typeof chunkmap).toBe('object');

            const { '.files': files } = chunkmap;
            expect(typeof files).toBe('object');

            // 根据 key 测试 chunkmap 中的文件
            const testFileFromFilelist = (key, shouldHasPublicPath = false) => {
                const pathname = files[key];
                expect(typeof pathname).toBe('string');

                const file = path.resolve(dist, pathname);
                expect(fs.existsSync(file)).toBe(true);

                const content = fs.readFileSync(file, 'utf-8');

                // 测试 CSS 内容
                const root = postcss.parse(content);
                const regExpPublicPath = /^includes\//g;
                postcssTransformDeclUrls(root, (url) => {
                    expect(regExpPublicPath.test(url)).toBe(
                        shouldHasPublicPath
                    );
                    return url;
                });
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

                if (config.webApp) await testHtmlWebAppMetaTags(content, dist);
                await testHtmlRenderedByKoot(content);
            }

            // 测试文件: 全局 CSS
            testFileFromFilelist(chunkNameExtractCss + '.css', true);
            testFileFromFilelist(chunkNameExtractCssForImport + '.css', false);

            await checkDistRootFiles({
                dist,
                env: 'prod',
                type: 'spa',
                serverMode: undefined,
            });
            await testFilesFromChunkmap(dist, false);
        });

        test(`[prod] 简易服务器可用 & JS 执行正确`, async () => {
            const fileServerJS = path.resolve(dist, './.server/index.js');
            expect(fs.existsSync(fileServerJS)).toBe(true);

            const port = config.port;
            const errors = [];

            const browser = await puppeteer.launch({
                headless: true,
            });
            const context = await browser.createIncognitoBrowserContext();

            const testSpaServer = async (cwd) => {
                // console.log({
                //     command: `node ${fileServerJS}`,
                //     cwd
                // });
                const child = execSync(`node ${fileServerJS}`, {
                    cwd,
                });
                const errors = [];
                child.stderr.on('data', (err) => {
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
                    waitUntil: 'networkidle0',
                });
                const html = await res.text();

                await testHtmlRenderedByKoot(html);
                await testRequestHidden404(origin, browser);
                await testAssetsGzip(origin, dist);
                await testClientLifecycles(origin, browser);

                await page.goto(origin + '/#/static');

                await page.close();

                // 测试: 没有失败的请求
                if (failedResponse.length) {
                    console.log(
                        'failedResponse',
                        failedResponse.map((res) => ({
                            status: res.status(),
                            url: res.url(),
                        }))
                    );
                }
                expect(failedResponse.length).toBe(0);
                if (errors.length) {
                    errors.forEach((e) => console.error(e));
                }
                expect(errors.length).toBe(0);

                // 测试: 多语言
                if (config.i18n) {
                    await testI18n({
                        browser,
                        origin,
                        i18n: config.i18n,
                        isDev: false,
                        isSPA: true,
                        cwd: dir,
                        dist,
                    });
                }

                // 结束测试
                await terminate(child.pid);
            };

            await testSpaServer(dir).catch((e) => {
                errors.push(e);
            });
            await testSpaServer(dist).catch((e) => {
                errors.push(e);
            });

            // TODO: 在设置了 sw 时有 sw 注册且没有报错

            await context.close();
            await browser.close();

            if (errors.length) {
                errors.forEach((e) => console.error(e));
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
            testFull(dir, 'koot.build.spa-3.js');
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
