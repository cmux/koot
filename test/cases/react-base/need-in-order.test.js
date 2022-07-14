/* eslint-disable no-console */
/**
 * React SSR 基础测试，主要用于测试打包结果的正确性。这些测试*不包括*
 * - ❌ SSR 数据
 * - ❌ 多语言
 * - ❌ 延迟渲染
 * - ❌ 空路由
 */
/**
 *
 * 不同的 Koot 配置会分别使用不同的配置，用以测试多种结果。以下是已有的案例
 *
 * no-bundles-keep
 * - bundleVersionsKeep: false
 * - exportGzip: false
 *
 */

// jest configuration
jest.setTimeout(10 * 60 * 1 * 1000);

//

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob-promise');
const util = require('util');
const execSync = require('child_process').exec;
const exec = util.promisify(require('child_process').exec);
const puppeteer = require('puppeteer');
const chalk = require('chalk');
const cheerio = require('cheerio');

//

// const {
//     filenameCurrentBundle
// } = require('../../../packages/koot/defaults/before-build');
const removeTempProjectConfig = require('../../../packages/koot/libs/remove-temp-project-config');
const sleep = require('../../../packages/koot/utils/sleep');
const getOutputsFile = require('../../../packages/koot/utils/get-outputs-path');

const {
    styles: puppeteerTestStyles,
    customEnv: puppeteerTestCustomEnv,
    injectScripts: puppeteerTestInjectScripts,
    requestHidden404: testRequestHidden404,
    criticalAssetsShouldBeGzip: testAssetsGzip,
    pageinfoOnlyMetas: puppeteerPageinfoOnlyMetas,
} = require('../puppeteer-test');
const addCommand = require('../../libs/add-command-to-package-json');
const terminate = require('../../libs/terminate-process');
const waitForPort = require('../../libs/get-port-from-child-process');
const testHtmlRenderedByKoot = require('../../general-tests/html/rendered-by-koot');
const testFilesFromChunkmap = require('../../general-tests/bundle/check-files-from-chunkmap');
const checkDistRootFiles = require('../../general-tests/check-dist-root-files');
const testHtmlWebAppMetaTags = require('../../general-tests/html/web-app-meta-tags');

//

global.kootTest = true;
process.env.KOOT_TEST_MODE = JSON.stringify(true);

//

const projects = require('../../projects/get')();

const projectsToUse = projects.filter((project) =>
    // Array.isArray(project.type) && project.type.includes('react-isomorphic')
    [
        'simple',
        'simple2',
        // 'standard',
    ].includes(project.name)
);

const commandTestBuild = 'koot-basetest';
const headless = false;

//

const defaultViewport = {
    width: 800,
    height: 800,
    deviceScaleFactor: 1,
};

let browser;
let context;
beforeAll(() =>
    puppeteer
        .launch({
            headless,
            defaultViewport,
        })
        .then((theBrowser) => {
            browser = theBrowser;
        })
);
afterAll(() => {
    if (browser && typeof browser.close === 'function') return browser.close();
    else throw new Error('No Puppeteer instance found');
});

//

let lastTime;
beforeEach(() => (lastTime = Date.now()));
afterEach(async () => {
    try {
        await context.close();
    } catch (e) {}
});

//

/**
 * 测试项目
 * @async
 * @param {Number} port
 * @param {string} dist
 * @param {Object} settings
 */
const doTest = async (port, dist, settings = {}) => {
    const {
        isDev = false,
        enableJavascript = true,
        customEnv = {},
        // childProcess
    } = settings;
    customEnv.notexist = undefined;

    const checkBackgroundResult = (styleValue) => {
        return styleValue
            .match(/url\([ "']*(.+?)[ '"]*\)/g)
            .every((assetUri) => {
                return assetUri.includes(
                    isDev
                        ? `__koot_webpack_dev_server__/dist/assets`
                        : `/test-includes/assets/`
                );
            });
    };
    const setScaleFactor = async (scale = 1) => {
        await page.setViewport({
            ...defaultViewport,
            deviceScaleFactor: scale,
        });
        await page.waitForTimeout(200);
    };
    const _log = (...args) => {
        if (false) console.log(...args);
    };

    context = await browser.createIncognitoBrowserContext();

    // console.log(-4);

    const page = await context.newPage();
    // await page.setJavaScriptEnabled(enableJavascript)
    if (!enableJavascript) {
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            const url = request.url();
            if (/\.js$/.test(url)) request.abort();
            else request.continue();
        });
    }
    const failedResponse = [];
    require('../../libs/puppeteer/page-event-response-failed-response')(
        page,
        failedResponse
    );

    const origin = isNaN(port) ? port : `http://127.0.0.1:${port}`;
    // console.log({ origin, port, t: typeof port });

    // console.log(-3);

    const res = await page
        .goto(origin, {
            waitUntil: 'load',
        })
        .catch();

    // console.log(-2);

    if (!res.ok()) {
        console.warn({
            res,
            text: await res.text(),
        });
    }

    // 请求应 OK
    expect(res.ok()).toBe(true);

    await testHtmlRenderedByKoot(await res.text());

    _log('base 图片应该引用打包结果的文件');
    {
        const { base, baseRelative } = await page.evaluate(() => {
            const el = document.querySelector('[data-bg-type="base"]');
            if (!el) return {};
            const elRelative = document.querySelector(
                '[data-bg-type="base-relative"]'
            );
            if (!elRelative) return {};
            return {
                base: window.getComputedStyle(el).backgroundImage,
                baseRelative:
                    window.getComputedStyle(elRelative).backgroundImage,
            };
        });
        expect(checkBackgroundResult(base)).toBe(true);
        expect(checkBackgroundResult(baseRelative)).toBe(true);
    }

    _log('respoinsive 图片应该引用打包结果的文件');
    {
        const result = {};
        const resultNative = {};
        const test = async (scale) => {
            await setScaleFactor(scale);
            const { value, valueNative } = await page.evaluate(() => {
                const el = document.querySelector(
                    '[data-bg-type="responsive"]'
                );
                if (!el) return {};
                const elNative = document.querySelector(
                    '[data-bg-type="responsive-native"]'
                );
                if (!elNative) return {};
                return {
                    value: window.getComputedStyle(el).backgroundImage,
                    valueNative:
                        window.getComputedStyle(elNative).backgroundImage,
                };
            });
            expect(checkBackgroundResult(value)).toBe(true);
            expect(checkBackgroundResult(valueNative)).toBe(true);
            result[scale] = value;
            resultNative[scale] = valueNative;
        };
        await test(1);
        await test(1.5);
        await test(2);
        // expect(result[1]).not.toBe(result[1.5]);
        // expect(result[1.5]).not.toBe(result[2]);
        // expect(resultNative[1]).not.toBe(resultNative[2]);
    }

    _log('react-router v3 兼容相关的属性');
    {
        const context = await browser.createIncognitoBrowserContext();
        const page = await context.newPage();
        const testLocation = {
            pathname: '/route-test/123',
            search: '?test=aaa',
            hash: '#bbb',
        };
        await page.goto(
            origin +
                testLocation.pathname +
                testLocation.search +
                testLocation.hash,
            {
                waitUntil: 'networkidle2',
            }
        );
        const testResults = await page.evaluate((testLocation) => {
            const results = {};
            const {
                props = {},
                propsInConnect = {},
                stateInConnect = {},
            } = window.__KOOT_TEST_ROUTE__;

            const isPropsValid = (props = {}) => {
                const {
                    location = {},
                    params = {},
                    route = {},
                    routeParams = {},
                    router = {},
                    routes,
                } = props;

                return (
                    location.hash === testLocation.hash &&
                    location.pathname === testLocation.pathname &&
                    location.search === testLocation.search &&
                    params.testId === '123' &&
                    (typeof route.component === 'function' ||
                        (typeof route.component === 'object' &&
                            typeof route.component.render === 'function')) &&
                    route.path === '/route-test/:testId' &&
                    routeParams.testId === '123' &&
                    typeof router.createHref === 'function' &&
                    typeof router.createKey === 'function' &&
                    typeof router.createLocation === 'function' &&
                    typeof router.createPath === 'function' &&
                    typeof router.getCurrentLocation === 'function' &&
                    typeof router.go === 'function' &&
                    typeof router.goBack === 'function' &&
                    typeof router.goForward === 'function' &&
                    typeof router.isActive === 'function' &&
                    typeof router.listen === 'function' &&
                    typeof router.listenBefore === 'function' &&
                    typeof router.location === 'object' &&
                    router.location.hash === testLocation.hash &&
                    router.location.pathname === testLocation.pathname &&
                    router.location.search === testLocation.search &&
                    typeof router.params === 'object' &&
                    router.params.testId === '123' &&
                    typeof router.push === 'function' &&
                    typeof router.replace === 'function' &&
                    Array.isArray(router.routes) &&
                    typeof router.setRouteLeaveHook === 'function' &&
                    typeof router.transitionTo === 'function' &&
                    typeof router.unsubscribe === 'function' &&
                    Array.isArray(routes)
                );
            };

            results.validLocationBeforeTransitionsInState =
                typeof stateInConnect.routing === 'object' &&
                typeof stateInConnect.routing.locationBeforeTransitions ===
                    'object' &&
                stateInConnect.routing.locationBeforeTransitions.hash ===
                    testLocation.hash &&
                stateInConnect.routing.locationBeforeTransitions.pathname ===
                    testLocation.pathname &&
                stateInConnect.routing.locationBeforeTransitions.search ===
                    testLocation.search;
            results.validPropsInConnect = isPropsValid(propsInConnect);
            results.validProps = isPropsValid(props);

            return results;
        }, testLocation);

        await page.close();
        await context.close();

        expect(typeof testResults).toBe('object');
        expect(testResults.validLocationBeforeTransitionsInState).toBe(true);
        expect(testResults.validPropsInConnect).toBe(true);
        expect(testResults.validProps).toBe(true);
    }

    _log('组件内手动 updatePageinfo');
    {
        const context = await browser.createIncognitoBrowserContext();
        const page = await context.newPage();
        await page.goto(origin + '/route-test/123?test=aaa#bbb', {
            waitUntil: 'networkidle2',
        });

        await page.evaluate(() => {
            const button = document.querySelector(
                '#__test-manually-update-pageinfo'
            );
            if (!button) return {};
            button.click();
        });
        await sleep(1000);
        const { title, metaTestRoute } = await page.evaluate(() => {
            const title = document.title;
            const metaTestRoute = document.querySelector('meta[test-route]');

            if (!metaTestRoute) return { title };

            return {
                title,
                metaTestRoute: metaTestRoute.getAttribute('test-route'),
            };
        });

        await page.close();
        await context.close();

        expect(title).toBe('TEST ROUTE');
        expect(metaTestRoute).toBe('test-route');
    }

    _log('使用工具函数手动更新 pageinfo');
    {
        const test = async (changedTitle, changedMetas) => {
            const context = await browser.createIncognitoBrowserContext();
            const page = await context.newPage();
            await page.goto(origin, {
                waitUntil: 'networkidle2',
            });

            const { result, oldTitle } = await page.evaluate(
                (changedTitle, changedMetas) => {
                    const r = {
                        oldTitle: document.title,
                    };

                    const $button = document.querySelector(
                        `#__test-client_update_pageinfo > button[data-change-title="${
                            changedTitle ? 'true' : 'false'
                        }"][data-change-metas="${
                            changedMetas ? 'true' : 'false'
                        }"]`
                    );
                    if (!$button) {
                        r.result = `no matched button`;
                        return r;
                    }

                    $button.click();

                    return r;
                },
                changedTitle,
                changedMetas
            );

            if (typeof result === 'string') {
                await context.close();
                return result;
            }

            await sleep(1000);

            const result2 = await page.evaluate(
                (oldTitle, changedTitle, changedMetas) => {
                    if (changedTitle && document.title === oldTitle)
                        return 'title has not changed';
                    if (!changedTitle && document.title !== oldTitle)
                        return 'title has changed';

                    const hasOldMeta = !!document.querySelector(
                        'meta[page-name="home"]'
                    );
                    if (changedMetas && hasOldMeta)
                        return 'meta has not changed';
                    if (!changedMetas && !hasOldMeta) return 'meta has changed';

                    return true;
                },
                oldTitle,
                changedTitle,
                changedMetas
            );

            await page.close();
            await context.close();

            return result2;
        };

        expect(await test(true, false)).toBe(true);
        expect(await test(false, true)).toBe(true);
        expect(await test(true, true)).toBe(true);
    }

    _log('WDS proxy');
    if (isDev) {
        const context = await browser.createIncognitoBrowserContext();
        const page = await context.newPage();
        // await page.goto(origin + '/proxy-1/policies?hl=en', {
        //     waitUntil: 'networkidle2',
        // });
        await page.goto(origin + '/proxy-1/more/', {
            waitUntil: 'networkidle2',
        });
        const title = await page.evaluate(() => document.title);

        await page.close();
        await context.close();

        // expect(title.includes('Policies') || title.includes('隐私政策')).toBe(
        //     true
        // );
        expect(title).toBe('百度产品大全');
    }

    _log('store 文件只会引用一次');
    {
        const context = await browser.createIncognitoBrowserContext();
        const page = await context.newPage();
        await page.goto(origin, {
            waitUntil: 'networkidle2',
        });
        await sleep(1000);

        const count = await page.evaluate(
            () => window.__REDUX_STOER_RUN_COUNT__
        );

        await page.close();
        await context.close();

        expect(count).toBe(1);
    }

    _log('SASS');
    {
        const context = await browser.createIncognitoBrowserContext();
        const page = await context.newPage();
        await page.goto(origin + '/sass-test', {
            waitUntil: 'networkidle2',
        });

        const { container, nested } = await page.evaluate(() => {
            const container = document.getElementById('__test-sass');
            if (!container) return {};
            const nested = container.querySelector('.nested');
            if (!nested) return {};
            return {
                container: parseInt(
                    window.getComputedStyle(container).fontSize
                ),
                nested: parseInt(window.getComputedStyle(nested).fontSize),
            };
        });

        await page.close();
        await context.close();

        expect(container).toBe(20);
        expect(nested).toBe(40);
    }

    _log('getStyles()');
    {
        const context = await browser.createIncognitoBrowserContext();
        const page = await context.newPage();
        await page.goto(origin, {
            waitUntil: 'networkidle2',
        });

        const { hasGlobal, hasModule } = await page.evaluate(() => {
            const { _global, ...modules } = window.__KOOT_TEXT_GET_STYLES__();
            const isPropValid = (obj) =>
                typeof obj === 'object' &&
                typeof obj.text === 'string' &&
                obj.rules instanceof CSSRuleList;
            return {
                hasGlobal: isPropValid(_global),
                hasModule:
                    Object.keys(modules).length > 0 &&
                    Object.values(modules).every(isPropValid),
            };
        });

        await page.close();
        await context.close();

        expect(hasGlobal).toBe(true);
        expect(hasModule).toBe(true);
    }

    _log('客户端使用 async/await');
    {
        const context = await browser.createIncognitoBrowserContext();
        const page = await context.newPage();
        await page.goto(origin, {
            waitUntil: 'networkidle2',
        });

        const { valueHasChanged } = await page.evaluate(async () => {
            const container = document.querySelector('#__test-async_await');
            const button = container.querySelector(
                'button[data-role="button"]'
            );
            const value = container.querySelector('[data-role="value"]');

            const currentValue = value.innerHTML;

            button.click();

            await new Promise((resolve) => setTimeout(resolve, 1500));

            return {
                oldValue: currentValue,
                newValue: value.innerHTML,
                valueHasChanged: Boolean(currentValue !== value.innerHTML),
            };
        });

        await page.close();
        await context.close();

        expect(valueHasChanged).toBe(true);
    }

    _log('服务器跳转多余 `/`');
    if (!isDev) {
        const context = await browser.createIncognitoBrowserContext();
        const page = await context.newPage();
        await page.goto(origin, {
            waitUntil: 'networkidle2',
        });
        const title = await page.evaluate(async () => {
            return document.title;
        });

        await page.close();
        await context.close();

        expect(title).toBe('Koot Boilerplate (Simple)');
    }

    _log('forward ref');
    {
        const context = await browser.createIncognitoBrowserContext();
        const page = await context.newPage();
        const res = await page.goto(origin, {
            waitUntil: 'load',
        });

        const HTML = await res.text();
        const $ = cheerio.load(HTML);
        const selector = '#__test-extend_forward_ref';

        const textSSR = $(selector).text();
        const classNameSSR = $(selector).attr('class');
        const { textCSR, classNameCSR } = await page.evaluate((selector) => {
            const el = document.querySelector(selector);
            const textCSR = el.innerText;
            const classNameCSR = el.getAttribute('class');
            return {
                textCSR,
                classNameCSR,
            };
        }, selector);

        await page.close();
        await context.close();

        expect(classNameSSR.includes('success')).toBe(false);
        expect(classNameCSR.includes('success')).toBe(true);
        expect(textSSR).not.toBe(textCSR);
    }

    _log(
        '通过配置 moduleCssFilenameTest，可以让 npm module 有组件 CSS 处理能力'
    );
    {
        const styles = await page.evaluate(() => {
            const el = document.querySelector('#__test-module_css');
            if (!el) return {};
            const styles = window.getComputedStyle(el);
            return [
                'backgroundColor',
                'color',
                'borderRadius',
                'textAlign',
            ].reduce((o, prop) => {
                o[prop] = styles[prop];
                return o;
            }, {});
        });
        expect(styles.backgroundColor).toBe('rgb(0, 146, 245)');
        expect(styles.color).toBe('rgb(255, 255, 255)');
        expect(styles.textAlign).toBe('center');
    }

    _log('WebApp 相关 <meta> 标签信息以及文件可用性');
    if (!isDev) {
        const HTML = await res.text();
        await testHtmlWebAppMetaTags(HTML, dist);
    }

    _log('[配置文件] `beforeBuild` `afterBuild`');
    {
        const testFile = path.resolve(dist, '_test-life-cycle.txt');
        const content = await fs.readFile(testFile, 'utf-8');
        const match = /^before mark: (\d+)\n/.exec(content);

        expect(match.length).toBe(2);

        const ts = match[1];
        const regex = new RegExp(`^before mark: ${ts}\\nafter mark: ${ts}\\n$`);

        expect(regex.test(content)).toBe(true);
    }
    _log(13);
    await puppeteerTestStyles(page);
    _log(14);
    await puppeteerTestCustomEnv(page, customEnv);
    _log(15);
    await puppeteerTestInjectScripts(page);
    _log(16);
    await puppeteerPageinfoOnlyMetas({ origin, browser });
    _log(17);
    await testRequestHidden404(origin, browser);
    _log(18);
    if (!isDev) await testAssetsGzip(origin, dist, browser);
    _log(19);

    // TODO: 在设置了 sw 时有 sw 注册且没有报错
    // TODO: 开发环境热更新

    // 关闭
    await page.close();
    await context.close();

    // 检查: 没有失败的请求
    if (failedResponse.length) {
        // eslint-disable-next-line no-console
        console.log(
            'failedResponse',
            failedResponse.map((res) => ({
                status: res.status(),
                url: res.url(),
                ref: res.ref.url(),
            }))
        );
    }
    expect(failedResponse.length).toBe(0);
};

/**
 * 测试项目开始前
 * @async
 * @param {String} cwd
 */
const beforeTest = async (cwd) => {
    // 重置
    await exec(`pm2 kill`);
    await removeTempProjectConfig(cwd);
    await fs.remove(path.resolve(cwd, 'dist'));
    await fs.remove(path.resolve(cwd, 'logs'));
    await fs.remove(path.resolve(cwd, 'node_modules/.cache'));
};

/**
 * 测试项目结束后
 * @async
 * @param {String} cwd
 * @param {String} title
 */
const afterTest = async (cwd, title) => {
    await sleep(2 * 1000);
    await exec(`pm2 kill`);
    // 移除临时项目配置文件
    await removeTempProjectConfig(cwd);

    // eslint-disable-next-line no-console
    console.log(
        chalk.green('√ ') +
            chalk.green(`${(Date.now() - lastTime) / 1000}s `) +
            title
    );

    await sleep(100);
};

//

const testOutputs = async (dist, countToBe) => {
    const fileOutputs = getOutputsFile(dist);
    const outputs = await fs.readJson(fileOutputs);

    const filesNeedToExist = [];
    for (const files of Object.values(outputs)) {
        files
            .map((file) => path.resolve(dist, file))
            .filter((file) => !filesNeedToExist.includes(file))
            .forEach((file) => filesNeedToExist.push(file));
    }

    // const filesExist = (
    //     await glob(path.resolve(dist, 'public', '**/*'), {
    //         dot: true,
    //     })
    // )
    //     .filter((file) => !fs.lstatSync(file).isDirectory())
    //     .map((file) => path.normalize(file));

    expect(fs.existsSync(dist)).toBe(true);
    expect(fs.existsSync(path.resolve(dist, 'public'))).toBe(true);
    expect(fs.existsSync(path.resolve(dist, 'public/service-worker.js'))).toBe(
        true
    );
    expect(fs.existsSync(fileOutputs)).toBe(true);
    expect(Object.keys(outputs).length).toBe(countToBe);

    // 不应有空目录
    async function getEmptyDirCount(directory, count = 0) {
        // lstat does not follow symlinks (in contrast to stat)
        const fileStats = await fs.lstat(directory);
        if (!fileStats.isDirectory()) {
            return;
        }
        const fileNames = await fs.readdir(directory);
        if (fileNames.length > 0) {
            const recursiveRemovalPromises = fileNames.map((fileName) =>
                getEmptyDirCount(path.join(directory, fileName), count)
            );
            await Promise.all(recursiveRemovalPromises);
        } else {
            count++;
        }

        // for (const fileName of fileNames) {
        //     const file = path.resolve(directory, fileName);
        //     const stat = await fs.lstat(file);
        //     if (stat.isDirectory()) {
        //         count++;
        //     }
        // }

        return count;
    }
    expect(await getEmptyDirCount(dist)).toBe(0);
};

//

describe('测试: React 同构项目', () => {
    for (const project of projectsToUse) {
        const { name, dir } = project;
        describe(`项目: ${name}`, () => {
            test(`ENV: prod`, async () => {
                await beforeTest(dir);

                const configFile = `koot.config.js`;
                const dist = path.resolve(dir, 'dist');
                if (fs.existsSync(dist)) fs.emptyDirSync(dist);
                else fs.removeSync(dist);

                const customEnv = {
                    aaaaa: '' + Math.floor(Math.random() * 10000),
                    bbbbb: 'a1b2c3',
                };
                const commandName = `${commandTestBuild}-prod`;
                const command = `koot-start --koot-test -- bbbbb=${customEnv.bbbbb}`;
                await addCommand(commandName, command, dir);

                // console.log(
                //     customEnv,
                //     `npm run ${commandName} -- aaaaa=${customEnv.aaaaa}`
                // );

                const child = execSync(
                    `npm run ${commandName} -- aaaaa=${customEnv.aaaaa}`,
                    {
                        cwd: dir,
                    }
                );
                const errors = [];

                await waitForPort(child);
                const port = require(path.resolve(dir, configFile)).port;
                child.stderr.on('data', (err) => {
                    errors.push(err);
                });

                expect(errors.length).toBe(0);

                // server-side 打包结果不应出现静态资源目录
                expect(
                    fs.existsSync(path.resolve(dist, 'server/index.js'))
                ).toBe(true);
                expect(fs.existsSync(path.resolve(dist, 'server/assets'))).toBe(
                    false
                );

                // 客户端打包结果应有 Gzip 版本
                {
                    const files = await glob(
                        path.resolve(dist, 'public/**/*.gz')
                    );
                    expect(files.length).not.toBe(0);
                }

                await checkDistRootFiles({
                    dist,
                    env: 'prod',
                    type: 'isomorphic',
                    serverMode: undefined,
                });
                await testFilesFromChunkmap(dist, false);
                await doTest(port, dist, {
                    customEnv,
                });
                await doTest(port, dist, {
                    enableJavascript: false,
                    customEnv,
                });

                // 测试: 项目 package.json 里应有 koot 属性对象
                {
                    const {
                        version: kootVersion,
                    } = require('koot/package.json');
                    const { koot: result } = require(path.resolve(
                        dir,
                        'package.json'
                    ));
                    expect(typeof result).toBe('object');
                    expect(result.version).toBe(kootVersion);
                }

                if (fs.existsSync(dist)) fs.emptyDirSync(dist);
                else fs.removeSync(dist);

                await terminate(child.pid);
                await afterTest(dir, 'ENV: prod');
            });

            test(`ENV: dev`, async () => {
                await beforeTest(dir);

                // const port = '8316'
                const dist = path.resolve(dir, 'dist');
                const customEnv = {
                    aaaaa: '' + Math.floor(Math.random() * 10000),
                    bbbbb: 'a1b2c3',
                };
                const commandName = `${commandTestBuild}-isomorphic-dev`;
                const command = `koot-dev --no-open --koot-test -- bbbbb=${customEnv.bbbbb}`;
                await addCommand(commandName, command, dir);

                const child = execSync(
                    `npm run ${commandName} -- aaaaa=${customEnv.aaaaa}`,
                    {
                        cwd: dir,
                        stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
                    }
                );
                const errors = [];

                const port = await waitForPort(
                    child,
                    / started on.*http:.*:([0-9]+)/
                );
                child.stderr.on('data', (err) => {
                    errors.push(err);
                });

                // console.log({
                //     port,
                //     errors,
                // })
                expect(errors.length).toBe(0);

                await sleep(2000);
                await doTest(port, dist, {
                    isDev: true,
                    customEnv,
                    childProcess: child,
                });
                await doTest(port, dist, {
                    isDev: true,
                    customEnv,
                    enableJavascript: false,
                    childProcess: child,
                });
                await terminate(child.pid);
                await afterTest(dir, 'ENV: dev');
            });

            test(`[config] bundleVersionsKeep: false`, async () => {
                await beforeTest(dir);

                const configFile = `koot.config.no-bundles-keep.js`;
                const dist = path.resolve(
                    dir,
                    require(path.resolve(dir, configFile)).dist
                );
                const commandName = `${commandTestBuild}-no_bundle_versions_keep`;
                const command = `koot-build -c --config ${configFile}`;
                const errors = [];

                await fs.remove(dist);
                await addCommand(commandName, command, dir);

                const chunks = `npm run ${commandName}`.split(' ');
                await new Promise((resolve) => {
                    const child = require('child_process').spawn(
                        chunks.shift(),
                        chunks,
                        {
                            cwd: dir,
                            stdio: false,
                            shell: true,
                        }
                    );
                    child.on('close', () => {
                        resolve();
                    });
                }).catch((e) => errors.push(e));

                expect(errors.length).toBe(0);

                await testFilesFromChunkmap(dist, false);
                await testOutputs(dist, 1);

                // 不应有 Gzip 版本
                {
                    const files = await glob(
                        path.resolve(dist, 'public/**/*.gz')
                    );
                    expect(files.length).toBe(0);
                }

                await fs.remove(dist);
                await afterTest(dir, '[config] bundleVersionsKeep: false');
            });

            test(`[config] bundleVersionsKeep: 3`, async () => {
                await beforeTest(dir);

                const configFile = `koot.config.bundles-keep.js`;
                const {
                    dist: _dist,
                    bundleVersionsKeep,
                } = require(path.resolve(dir, configFile));
                const dist = path.resolve(dir, _dist);
                const commandName = `${commandTestBuild}-bundle_versions_keep`;
                const command = `koot-build -c --config ${configFile}`;
                const errors = [];

                await fs.remove(dist);
                await addCommand(commandName, command, dir);

                // 打包多次
                for (let i = 0; i < bundleVersionsKeep + 2; i++) {
                    const chunks = `npm run ${commandName}`.split(' ');
                    await new Promise((resolve) => {
                        const child = require('child_process').spawn(
                            chunks.shift(),
                            chunks,
                            {
                                cwd: dir,
                                stdio: false,
                                shell: true,
                            }
                        );
                        child.on('close', () => {
                            resolve();
                        });
                    }).catch((e) => errors.push(e));
                }

                // const dirPublic = path.resolve(dist, 'public');
                expect(errors.length).toBe(0);

                // const files = (await fs.readdir(dirPublic))
                //     .filter(filename => filename !== filenameCurrentBundle)
                //     .map(filename => path.resolve(dirPublic, filename));
                // const kootVersionFolders = (await fs.readdir(dirPublic)).filter(
                //     filename => {
                //         const file = path.resolve(dirPublic, filename);
                //         const lstat = fs.lstatSync(file);
                //         if (!lstat.isDirectory()) return false;
                //         return /^koot-[0-9]+$/.test(filename);
                //     }
                // );

                // 打包结果目录数量应该正确
                // expect(kootVersionFolders.length).toBe(files.length);
                // expect(kootVersionFolders.length).toBe(bundleVersionsKeep);

                // 当前打包结果版本应该存在
                // const currentID =
                //     kootVersionFolders[kootVersionFolders.length - 1];
                // const dirCurrent = path.resolve(dirPublic, currentID);
                // const fileCurrent = path.resolve(
                //     dirPublic,
                //     filenameCurrentBundle
                // );
                // expect(fs.existsSync(fileCurrent)).toBe(true);
                // expect(currentID).toBe(fs.readFileSync(fileCurrent, 'utf-8'));
                // expect(fs.existsSync(dirCurrent)).toBe(true);
                // expect(
                //     fs.existsSync(path.resolve(dirCurrent, 'includes'))
                // ).toBe(true);

                await testOutputs(dist, bundleVersionsKeep);

                await fs.remove(dist);
                await afterTest(dir, '[config] bundleVersionsKeep: 3');
            });
        });
    }
});
