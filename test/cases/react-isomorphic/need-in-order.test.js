/**
 * React SSR 完全测试
 *
 * 不同的 Koot 配置会分别使用不同的配置，用以测试多种结果。以下是已有的案例
 *
 * **store**
 * - 默认配置
 *     - 提供创建 store 的方法
 *     - 使用 koot 封装的 createStore 方法
 *     - 提供的 reducer 是 Object
 *     - 提供 enhancer
 * - i18n.use="router"
 *     - 提供创建 store 的方法
 *     - 使用 koot 封装的 createStore 方法
 *     - 提供的 reducer 是 Function
 * - bundleVersionsKeep=false
 *     - 提供创建 store 的方法
 *     - 使用自定函数
 * - 0.6版配置
 *     - 仅提供 reducer 列表
 *
 * **sessionStore**
 * - 默认配置
 *     - `true` (全部开启)
 * - i18n.use="router"
 *     - `all` (全部开启)
 * - bundleVersionsKeep=false
 *     - 部分开启，同时混入无效设置
 * - 0.6版配置
 *     - 禁用
 */

// jest configuration
jest.setTimeout(5 * 60 * 1 * 1000);

//

const fs = require('fs-extra');
const path = require('path');
const util = require('util');
const execSync = require('child_process').exec;
const exec = util.promisify(require('child_process').exec);
const puppeteer = require('puppeteer');
const chalk = require('chalk');
const get = require('lodash/get');
const cheerio = require('cheerio');

//

const {
    changeLocaleQueryKey,
    sessionStoreKey
} = require('../../../packages/koot/defaults/defines');
const defaultKootConfig = require('../../../packages/koot/defaults/koot-config');
const removeTempProjectConfig = require('../../../packages/koot/libs/remove-temp-project-config');
const sleep = require('../../../packages/koot/utils/sleep');
const addCommand = require('../../libs/add-command-to-package-json');
const terminate = require('../../libs/terminate-process');
const waitForPort = require('../../libs/get-port-from-child-process');
const checkForChunkmap = require('../../libs/check-for-chunkmap');
const filterState = require('../../../packages/koot/libs/filter-state');
const testHtmlRenderedByKoot = require('../../general-tests/html/rendered-by-koot');
const testFilesFromChunkmap = require('../../general-tests/bundle/check-files-from-chunkmap');

//

const {
    injectScripts: puppeteerTestInjectScripts,
    requestHidden404: testRequestHidden404,
    criticalAssetsShouldBeGzip: testAssetsGzip
} = require('../puppeteer-test');

//

global.kootTest = true;
process.env.KOOT_TEST_MODE = JSON.stringify(true);

//

const projects = require('../../projects/get')();

const projectsToUse = projects.filter(
    project =>
        // Array.isArray(project.type) && project.type.includes('react-isomorphic')
        project.name === 'standard'
);

const commandTestBuild = 'koot-buildtest';
/** @type {Boolean} 是否进行完整测试。如果为否，仅测试一次打包结果 */
const fullTest = true;
const headless = true;

//

let browser;
beforeAll(() =>
    puppeteer
        .launch({
            headless
        })
        .then(theBrowser => {
            browser = theBrowser;
        })
);
afterAll(() =>
    browser
        .close()
        .then(() => (browser = undefined))
        .then(() => exec(`pm2 kill`))
);

//

let lastTime;
beforeEach(() => (lastTime = Date.now()));

//

/**
 * 生产环境基准测试
 * @param {string} name
 * @param {string} dir
 * @param {string} configFilename
 * @param {string} script
 * @param {Object} [extraConing]
 */
const testProduction = (
    name,
    dir,
    configFilename,
    script,
    extraConing = {}
) => {
    const testName = `[prod] 打包并运行生产模式 (${name})`;
    return test(testName, async () => {
        await beforeTest(dir);

        const config = require(path.resolve(dir, configFilename));
        const dist = path.resolve(dir, config.dist);
        const commandName = `${commandTestBuild}-${script}-production`;
        const command = `koot-start --koot-test --config ${configFilename}`;

        await emptyDist(dist);
        await addCommand(commandName, command, dir);

        const child = execSync(`npm run ${commandName}`, {
            cwd: dir
        });
        const errors = [];

        await waitForPort(child);
        // const port = await getPortFromConfig(dir)
        const port = require('../../../packages/koot/utils/get-port')(
            config.port
        );
        child.stderr.on('data', err => {
            errors.push(err);
        });

        expect(errors.length).toBe(0);

        await testFilesFromChunkmap(dist);
        await testCodeSplitting(dist);
        await doPuppeteerTest(port, dist, {
            kootConfig: config,
            ...extraConing
        });
        await terminate(child.pid);

        await emptyDist(dist);
        await afterTest(dir, testName);
    });
};

/**
 * 开发环境基准测试
 * @param {string} name
 * @param {string} dir
 * @param {string} configFilename
 * @param {string} script
 * @param {Object} [extraConing]
 */
const testDevelopment = (
    name,
    dir,
    configFilename,
    script,
    extraConing = {}
) => {
    const testName = `[dev] 启动开发模式并访问 (${name})`;
    test(testName, async () => {
        await beforeTest(dir);

        const config = require(path.resolve(dir, configFilename));
        // const port = '8316'
        const commandName = `${commandTestBuild}-${script}-development`;
        const command = `koot-dev --no-open --koot-test --config ${configFilename}`;
        await addCommand(commandName, command, dir);

        const child = execSync(`npm run ${commandName}`, {
            cwd: dir,
            stdio: ['pipe', 'pipe', 'pipe', 'ipc']
        });
        const errors = [];

        const port = await waitForPort(child, / on.*http:.*:([0-9]+)/);
        child.stderr.on('data', err => {
            errors.push(err);
        });

        // console.log({
        //     port,
        //     errors,
        // })
        expect(errors.length).toBe(0);

        await doPuppeteerTest(port, undefined, {
            kootConfig: config,
            isDev: true,
            ...extraConing
        });
        await terminate(child.pid);

        await afterTest(dir, testName);
    });
};

const testFull = (...args) => {
    testProduction(...args);
    testDevelopment(...args);
};

//

/**
 * 测试代码分割
 * @async
 * @param {String} dist
 */
const testCodeSplitting = async dist => {
    const check = chunkmap => {
        const { '.files': files } = chunkmap;
        const { 'client.js': client, 'PageHome.js': home } = files;

        expect(
            fs
                .readFileSync(path.resolve(dist, client))
                .includes('!:!:! KOOT TEST ROUTES CONFIG !:!:!')
        ).toBe(true);
        expect(
            fs
                .readFileSync(path.resolve(dist, client))
                .includes('!:!:! KOOT TEST VIEW: WELCOME PAGE !:!:!')
        ).toBe(false);
        expect(
            fs
                .readFileSync(path.resolve(dist, home))
                .includes('!:!:! KOOT TEST VIEW: WELCOME PAGE !:!:!')
        ).toBe(true);
    };
    await checkForChunkmap(dist, check);
};

/**
 * 从配置文件中分析服务器端口号
 * @param {String} dir
 * @returns {number} port
 */
// const getPortFromConfig = async (dir) => {
//     const config = require(path.resolve(dir, 'koot.config.js'))
//     return require('../../../packages/koot/utils/get-port')(config.port)
// }

/**
 * 测试项目
 * @async
 * @param {Number} port
 * @param {Object} settings
 * @param {Object} [settings.kootConfig={}] Koot 配置对象
 * @param {Object} [settings.i18nUseRouter=false] 多语言使用路由模式
 */
const doPuppeteerTest = async (port, dist, settings = {}) => {
    const context = await browser.createIncognitoBrowserContext();
    const origin = isNaN(port) ? port : `http://127.0.0.1:${port}`;
    const {
        kootConfig = {},
        i18nUseRouter = false,
        isDev = false,
        selectorForStoreEnhancer
    } = settings;

    const getLocaleId = async page => {
        return await page.evaluate(() =>
            document
                .querySelector('meta[name="koot-locale-id"]')
                .getAttribute('content')
        );
    };

    const getSSRState = async page =>
        await page.evaluate(() => window.__REDUX_STATE__);

    const page = await context.newPage();
    const failedResponse = [];
    require('../../libs/puppeteer/page-event-response-failed-response')(
        page,
        failedResponse
    );

    // 测试: 页面基本结构
    {
        const res = await page
            .goto(origin, {
                waitUntil: 'domcontentloaded'
            })
            .catch();
        const pageContent = await page.content();

        await testHtmlRenderedByKoot(await res.text());

        // 测试: 页面请求应 OK
        expect(res.ok()).toBe(true);

        // 测试: 页面标题的注入应成功
        const pageTitle = await page.evaluate(
            () => document.querySelector('title').innerText
        );
        expect(typeof pageTitle).toBe('string');

        // 测试: #app 是否存在
        const $app = await page.$('#app');
        expect(typeof $app).toBe('object');

        // 测试: <script> 标签之间不应有 ,
        expect(/<\/script>,<script/g.test(pageContent)).toBe(false);

        // 测试: 配置 webpack.internalLoaders['less-loader']
        const baseFontSize = await page.evaluate(() =>
            getComputedStyle(document.body).getPropertyValue('font-size')
        );
        expect(baseFontSize).toBe('40px');

        if (i18nUseRouter) {
            // 页面是否已跳转
            const pageUrl = await page.url();
            expect(new RegExp(`^${origin}/.+`).test(pageUrl)).toBe(true);
        }

        // 测试：点击 Link 组件的路由跳转
        {
            let err;
            // await page.click('a[href$="/static"]');
            await Promise.all([
                page
                    .waitFor(`#main > [data-koot-test-page="static"]`, {
                        timeout: 5000
                    })
                    .catch(e => {
                        throw e;
                    }),
                page.evaluate(() => {
                    document.querySelector('a[href$="/static"]').click();
                })
            ]).catch(e => (err = e));
            expect(typeof err).toBe('undefined');
        }
    }

    // 测试: 利用 URL 可切换到对应语种，并且 SSR 数据正确
    {
        /**
         * 测试目标语种
         * @param {String} localeId 语种ID
         * @param {Object} infos 测试目标值
         * @param {String} infos.title 页面标题
         * @param {String} infos.description 页面简介
         */
        const testTargetLocaleId = async (localeId, infos = {}) => {
            const gotoUrl = i18nUseRouter
                ? `${origin}/${localeId}/extend`
                : `${origin}/extend?${changeLocaleQueryKey}=${localeId}`;

            const res = await page.goto(gotoUrl, {
                waitUntil: 'domcontentloaded'
            });
            const HTML = await res.text();
            const $ = cheerio.load(HTML);

            // 测试语种 ID 正确
            const theLocaleId = await getLocaleId(page);
            expect(theLocaleId).toBe(localeId);

            // 测试页面标题正确
            const pageTitle = await page.evaluate(
                () => document.querySelector('title').innerText
            );
            expect(pageTitle).toBe(infos.title);

            // 测试页面简介正确
            const pageDescription = await page.evaluate(
                () =>
                    document.querySelector('meta[description]') &&
                    document
                        .querySelector('meta[description]')
                        .getAttribute('description')
            );
            expect(pageDescription).toBe(infos.description);

            // 测试 SSR Redux state 正确
            const SSRState = await getSSRState(page);
            const SSRServerTime = await page.evaluate(
                () =>
                    document.querySelector('.timestamp strong') &&
                    new Date(
                        document.querySelector('.timestamp strong').innerText
                    ).getTime()
            );
            expect(typeof SSRState.infos.serverTimestamp).toBe('number');
            expect(SSRServerTime).toBe(SSRState.infos.serverTimestamp);

            // 测试 __() 输出为对象的情况
            expect($('#__test-locales-export-object').text()).toBe(
                infos.exportObject
            );
            expect(
                await page.evaluate(
                    () =>
                        document.querySelector('#__test-locales-export-object')
                            .innerText
                )
            ).toBe(infos.exportObject);
        };

        await testTargetLocaleId('zh', {
            title: '组件扩展 - Koot.js 模板项目',
            description: '简介：Koot.js 组件扩展',
            exportObject: '欢迎'
        });
        await testTargetLocaleId('en', {
            title: 'Component Extend - Koot.js boilerplate',
            description: 'Summary information for Koot.js Component Extend.',
            exportObject: 'Welcome'
        });
    }

    // 测试: 到其他语种的链接
    {
        const testLinksToOtherLang = async (
            toLocaleId = '',
            urlAppend = ''
        ) => {
            const gotoUrl = i18nUseRouter
                ? `${origin}/${toLocaleId}${urlAppend}`
                : `${origin}${urlAppend}${
                      urlAppend.includes('?') ? '&' : '?'
                  }${changeLocaleQueryKey}=${toLocaleId}`;
            await page.goto(gotoUrl, {
                waitUntil: 'domcontentloaded'
            });

            const localeId = await page.evaluate(() =>
                document
                    .querySelector('meta[name="koot-locale-id"]')
                    .getAttribute('content')
            );
            const linksToOtherLang = await page.$$eval(
                `link[rel="alternate"][hreflang][href]:not([hreflang="${localeId}"])`,
                els =>
                    Array.from(els).map(el => ({
                        lang: el.getAttribute('hreflang'),
                        href: el.getAttribute('href')
                    }))
            );
            /** @type {Object[]} */
            const linksToSameLang = await page.$$eval(
                `link[rel="alternate"][hreflang="${localeId}"][href]`,
                els =>
                    Array.from(els).map(el => ({
                        lang: el.getAttribute('hreflang'),
                        href: el.getAttribute('href')
                    }))
            );

            expect(linksToSameLang.length).toBe(0);
            expect(Array.isArray(linksToOtherLang)).toBe(true);
            expect(linksToOtherLang.length).toBeGreaterThan(0);

            for (const o of linksToOtherLang) {
                const { lang, href } = o;
                await page.goto(href, {
                    waitUntil: 'networkidle0'
                });
                const localeId = await page.evaluate(() =>
                    document
                        .querySelector('meta[name="koot-locale-id"]')
                        .getAttribute('content')
                );
                expect(lang).toBe(localeId);
            }
        };
        await testLinksToOtherLang();
        await testLinksToOtherLang(`zh`);
        await testLinksToOtherLang(`zh-tw`);
        await testLinksToOtherLang('', '?test=a');
        await testLinksToOtherLang('zh', '?test=a');
        await testLinksToOtherLang('zh-tw', '?test=a');
    }

    // 测试: 并发请求 state 是否正确
    if (!isDev) {
        await Promise.all([
            new Promise(async resolve => {
                const pageDelayed = await context.newPage();
                const localeIdDelayed = 'en';
                const gotoUrlDelayed = i18nUseRouter
                    ? `${origin}/${localeIdDelayed}/delayed`
                    : `${origin}/delayed?${changeLocaleQueryKey}=${localeIdDelayed}`;
                await pageDelayed.goto(gotoUrlDelayed, {
                    waitUntil: 'domcontentloaded'
                });
                const theLocaleId = await getLocaleId(pageDelayed);
                expect(theLocaleId).toBe(localeIdDelayed);
                resolve();
            }),
            new Promise(async resolve => {
                const localeId = 'zh';
                const gotoUrl = i18nUseRouter
                    ? `${origin}/${localeId}`
                    : `${origin}?${changeLocaleQueryKey}=${localeId}`;
                await page.goto(gotoUrl, {
                    waitUntil: 'domcontentloaded'
                });
                const theLocaleId = await getLocaleId(page);
                expect(theLocaleId).toBe(localeId);
                resolve();
            })
        ]);
    }

    // 测试: 访问没有指定组件的路由
    {
        const name = 'testtesttest';

        // 先测试父级路由
        const urlParent = `${origin}/static`;
        await page
            .goto(urlParent, {
                waitUntil: 'domcontentloaded'
            })
            .catch();
        const hasFeature = await page.evaluate(
            () => !!document.querySelector('.no-component-given')
        );
        expect(hasFeature).toBe(false);

        // 没有指定组件的路由
        const urlNoGiven = `${origin}/static/${name}`;
        const res = await page
            .goto(urlNoGiven, {
                waitUntil: 'networkidle0'
            })
            .catch();

        // 测试: 请求应 OK
        expect(res.ok()).toBe(true);

        // 测试: 相关页面特征存在
        const featureString = await page.evaluate(() => {
            const el = document.querySelector('.no-component-given');
            if (el) return el.innerText;
            return '';
        });
        expect(featureString).toBe(name);
    }

    // 测试: 利用 staticCopyFrom 配置复制的文件可访问
    {
        const testUrl = `${origin}/__test.txt`;
        const testContent = 'TEST';
        const res = await page.goto(testUrl, {
            waitUntil: 'networkidle0'
        });
        const result = await res.text();
        expect(res.ok()).toBe(true);
        expect(result).toBe(testContent);
    }

    // 测试：sessionStore
    {
        const context = await browser.createIncognitoBrowserContext();
        const page = await context.newPage();
        await page.goto(origin, {
            waitUntil: 'networkidle0'
        });

        const { sessionStore = defaultKootConfig.sessionStore } = kootConfig;
        const getSessionStoreAfterRefresh = async () => {
            // 点击 GET DATA
            const selectorBtn =
                '#koot-debug [data-section="app-name"] [data-button="get-data"]';
            await Promise.all([
                page.click(selectorBtn),
                page.waitForSelector(selectorBtn, {
                    hidden: true
                })
                // page.waitForResponse(response =>
                //     /\/app-name$/.test(response.url())
                // )
            ]);

            const before = await page.evaluate(() => {
                return {
                    stateBefore: window.__KOOT_STORE__.getState(),
                    ssrState: window.__REDUX_STATE__
                };
            });
            before.stateBefore = filterState(before.stateBefore);
            before.ssrState = filterState(before.ssrState);

            await page.reload({ waitUntil: 'networkidle0' });

            const after = {
                ...(await page.evaluate(sessionStoreKey => {
                    let sessionStore;
                    try {
                        sessionStore = JSON.parse(
                            window.sessionStorage.getItem(sessionStoreKey)
                        );
                    } catch (e) {}

                    let content;
                    try {
                        content = document.querySelector(
                            '#koot-debug [data-section="app-name"] .section-content'
                        ).innerText;
                    } catch (e) {}

                    return {
                        sessionStore,
                        state: window.__KOOT_STORE__.getState(),
                        content
                    };
                }, sessionStoreKey))
            };

            after.state = filterState(after.state);

            return {
                ...before,
                ...after
            };
        };

        if (sessionStore === true || sessionStore === 'all') {
            const result = await getSessionStoreAfterRefresh();
            expect(result.stateBefore).toEqual(result.sessionStore);
            expect(result.sessionStore).toEqual(result.state);
            expect(result.state).not.toEqual(result.ssrState);
            expect(result.content).toBe(result.state.kootTest.app.name);
        } else if (typeof sessionStore === 'object') {
            const result = await getSessionStoreAfterRefresh();
            const checkValue = (obj, accumulatedKey = '') => {
                Object.keys(obj).forEach(key => {
                    const value = obj[key];
                    if (typeof value === 'object') {
                        checkValue(
                            value,
                            accumulatedKey + `[${JSON.stringify(key)}]`
                        );
                    } else {
                        const keyCur =
                            accumulatedKey + `[${JSON.stringify(key)}]`;
                        const valueInStateBefore = get(
                            result.stateBefore,
                            keyCur
                        );
                        const valueInSessionStore = get(
                            result.sessionStore,
                            keyCur
                        );
                        const valueInStateAfter = get(result.state, keyCur);
                        if (typeof valueInStateBefore === 'undefined') {
                            expect(valueInSessionStore).toBe(undefined);
                            expect(valueInStateAfter).toBe(undefined);
                        } else {
                            expect(valueInStateBefore).toBe(
                                valueInSessionStore
                            );
                            expect(valueInSessionStore).toBe(valueInStateAfter);
                        }
                    }
                });
            };
            checkValue(sessionStore);
            if (get(result.state, 'kootTest.app.name')) {
                expect(result.content).toBe(result.state.kootTest.app.name);
            } else {
                expect(result.content).not.toBe(
                    result.stateBefore.kootTest.app.name
                );
            }
            expect(result.state).not.toEqual(result.ssrState);
        } else {
            const result = await getSessionStoreAfterRefresh();
            expect(result.sessionStore).toBe(null);
            expect(result.stateBefore).not.toEqual(result.state);
            expect(result.state.kootTest).toEqual(result.ssrState.kootTest);
            expect(result.content).not.toBe(
                result.stateBefore.kootTest.app.name
            );
        }

        await page.close();
        await context.close();
    }

    // 测试：使用 TypeScript 编写的组件
    {
        const pageTS = origin + '/ts';
        await page.goto(pageTS, {
            waitUntil: 'domcontentloaded'
        });
        const el = await page.$('[data-koot-test-page="page-ts"]');
        expect(el).not.toBe(null);
    }

    // 测试：extend 高阶组件的 SSR 控制
    {
        const context = await browser.createIncognitoBrowserContext();
        const page = await context.newPage();

        const res = await page.goto(origin, {
            waitUntil: 'networkidle0'
        });

        const HTML = await res.text();
        const $ = cheerio.load(HTML);

        const client = {
            NoSSR: await page.$('#koot-test-no-ssr'),
            ControledSSR: await page.$('#koot-test-controled-ssr')
        };
        const server = {
            NoSSR: $('#koot-test-no-ssr'),
            ControledSSR: $('#koot-test-controled-ssr')
        };

        expect(client.NoSSR).not.toBe(null);
        expect(client.ControledSSR).not.toBe(null);

        expect(server.NoSSR.text()).toBe('');
        expect(server.ControledSSR.text()).toBe('Alternative content');

        await page.close();
        await context.close();
    }

    // 测试：页面信息应来自深部组件，而非外部父级
    {
        const specialMetaKey = 'koot-test-meta-aaa';

        // 直接访问 /ts
        {
            const context = await browser.createIncognitoBrowserContext();
            const page = await context.newPage();
            const res = await page.goto(origin + '/ts', {
                waitUntil: 'networkidle0'
            });
            const HTML = await res.text();
            const $ = cheerio.load(HTML);

            const titleSSR = $('head title').text();
            const specialMetaSSR = $(`meta[${specialMetaKey}]`).attr(
                specialMetaKey
            );

            const titleCSR = await page.evaluate(() => document.title);
            const specialMetaCSR = await page.evaluate(specialMetaKey => {
                const meta = document.querySelector(`meta[${specialMetaKey}]`);
                if (meta) return meta.getAttribute(specialMetaKey);
                return '';
            }, specialMetaKey);

            expect(titleSSR).toBe('AAA');
            expect(titleSSR).toBe(titleCSR);
            expect(specialMetaSSR).toBe('AAA');
            expect(specialMetaSSR).toBe(specialMetaCSR);

            await page.close();
            await context.close();
        }

        // 路由跳转到 /ts
        {
            const context = await browser.createIncognitoBrowserContext();
            const page = await context.newPage();
            await page.goto(origin, {
                waitUntil: 'networkidle0'
            });
            await Promise.all([
                page.waitFor(`[data-koot-test-page="page-ts"]`),
                page.click('a[href$="/ts"]')
            ]);

            const titleCSR = await page.evaluate(() => document.title);
            const specialMetaCSR = await page.evaluate(specialMetaKey => {
                const meta = document.querySelector(`meta[${specialMetaKey}]`);
                if (meta) return meta.getAttribute(specialMetaKey);
                return '';
            }, specialMetaKey);

            expect(titleCSR).toBe('AAA');
            expect(specialMetaCSR).toBe('AAA');

            await page.close();
            await context.close();
        }

        // 直接访问 /test-pageinfo-deep
        {
            const context = await browser.createIncognitoBrowserContext();
            const page = await context.newPage();
            const res = await page.goto(origin + '/test-pageinfo-deep', {
                waitUntil: 'networkidle0'
            });
            const HTML = await res.text();
            const $ = cheerio.load(HTML);

            const titleSSR = $('head title').text();
            const titleCSR = await page.evaluate(() => document.title);

            expect(titleSSR).toBe('AAA');
            expect(titleSSR).toBe(titleCSR);

            await page.close();
            await context.close();
        }

        // 路由跳转到 /test-pageinfo-deep
        {
            const context = await browser.createIncognitoBrowserContext();
            const page = await context.newPage();
            await page.goto(origin, {
                waitUntil: 'networkidle0'
            });
            await Promise.all([
                page.waitFor(`[data-koot-test-page="page-test-pageinfo-deep"]`),
                // page.click('a[href$="/test-pageinfo-deep"]'),
                page.evaluate(() => {
                    document
                        .querySelector('a[href$="/test-pageinfo-deep"]')
                        .click();
                })
            ]);

            const titleCSR = await page.evaluate(() => document.title);

            expect(titleCSR).toBe('AAA');

            await page.close();
            await context.close();
        }
    }

    // 测试: Store enhancer
    if (typeof selectorForStoreEnhancer === 'string') {
        const getValue = async () => {
            const context = await browser.createIncognitoBrowserContext();
            const page = await context.newPage();
            const res = await page.goto(origin, {
                waitUntil: 'domcontentloaded'
            });
            const HTML = await res.text();
            const $ = cheerio.load(HTML);
            const result = $(selectorForStoreEnhancer).text();
            await page.close();
            await context.close();
            return result;
        };
        const value1 = await getValue();
        await sleep(10 * 1000);
        const value2 = await getValue();
        expect(!!value1).toBe(true);
        expect(value1).toBe(value2);
    }

    // 测试: 服务器端公共缓存空间
    {
        // __test-server-cache
        let expectG, expectL;
        const values = {};
        const getValue = async localeId => {
            const gotoUrl = i18nUseRouter
                ? `${origin}/${localeId}/test-server-cache`
                : `${origin}/test-server-cache?${changeLocaleQueryKey}=${localeId}`;
            const context = await browser.createIncognitoBrowserContext();
            const page = await context.newPage();
            const res = await page.goto(gotoUrl, {
                waitUntil: 'domcontentloaded'
            });
            const HTML = await res.text();
            const $ = cheerio.load(HTML);
            const el = $('#__test-server-cache');
            if (!expectG) expectG = el.attr('data-expect-g');
            if (!expectL) expectL = el.attr('data-expect-l');
            const result = el.text();
            // console.log(result);
            await page.close();
            await context.close();
            return result;
        };

        values.zh1 = await getValue('zh');
        values.en1 = await getValue('en');
        await sleep(10 * 1000);
        values.zh2 = await getValue('zh');

        expect(values.zh1).toBe('');
        expect(values.en1).toBe(expectG);
        expect(values.zh2).toBe(expectG + expectL);
    }

    // TODO: 测试: 所有 Webpack 结果资源的访问

    // TODO: 测试: 有 extract.all.[*].css

    // TODO: 测试: inject 的函数用法

    // TODO: 测试: extend connect 的 Array 用法

    // TODO: 测试: hydrate 不会触发重新渲染

    // TODO: 测试: 开发环境热更新 (JSX & TSX)

    // TODO: 测试: 访问404

    // TODO: 测试: 访问全局子路由 (例: 路由配置了 /a，强行访问 /a/b)

    // TODO: 测试: 同一个通配路由，访问另一个URL，检查同构结果 (connect component 是否可用)

    // TODO: 在设置了 sw 时有 sw 注册且没有报错

    // 其他公用测试
    await puppeteerTestInjectScripts(page);
    await testRequestHidden404(origin, browser);
    if (!isDev) await testAssetsGzip(origin, dist, browser);

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

    // 结束测试
    await page.close();
    await context.close();

    return;
};

/**
 * 测试项目开始前
 * @async
 * @param {String} cwd
 */
const beforeTest = async cwd => {
    // 重置
    await exec(`pm2 kill`);
    await removeTempProjectConfig(cwd);
};

/**
 * 测试项目结束后
 * @async
 * @param {String} cwd
 * @param {String} title
 */
const afterTest = async (cwd, title) => {
    // await fs.remove(path.resolve(cwd, 'logs'));
    await sleep(2 * 1000);
    await exec(`pm2 kill`);
    // 移除临时项目配置文件
    await removeTempProjectConfig(cwd);

    console.log(
        chalk.green('√ ') +
            chalk.green(`${(Date.now() - lastTime) / 1000}s `) +
            title
    );
};

const emptyDist = async dir => {
    if (!fs.existsSync(dir)) return;
    const files = await fs.readdir(dir);
    for (const filename of files) {
        const file = path.resolve(dir, filename);
        const lstat = fs.lstatSync(file);
        if (!(filename === 'node_modules' && lstat.isDirectory())) {
            await fs.remove(file);
        }
    }
};

//

describe('测试: React 同构项目', () => {
    for (const project of projectsToUse) {
        const { name, dir } = project;
        describe(`项目: ${name}`, () => {
            test(`[prod] 使用 koot-build 命令进行打包`, async () => {
                await beforeTest(dir);
                await emptyDist(path.resolve(dir, 'dist'));

                const configFile = `koot.config.js`;
                const dist = path.resolve(
                    dir,
                    require(path.resolve(dir, configFile)).dist
                );

                const commandName = `${commandTestBuild}-isomorphic-build`;
                const command = `koot-build --env prod --koot-test`;
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

                await testFilesFromChunkmap(dist);
                await testCodeSplitting(dist);
                await afterTest(dir, '[prod] 使用 koot-build 命令进行打包');
            });
            test(`[prod] 使用 koot-start (--no-build) 命令启动服务器并访问`, async () => {
                await beforeTest(dir);

                const dist = path.resolve(dir, 'dist');
                const configFile = `koot.config.js`;
                const commandName = `${commandTestBuild}-isomorphic-start-server`;
                const command = `koot-start --no-build --koot-test`;
                await addCommand(commandName, command, dir);

                const child = execSync(
                    `npm run ${commandName}`,
                    {
                        cwd: dir
                    }
                    // (err, stdout, stderr) => {
                    //     console.log('err', err)
                    //     console.log('stdout', stdout)
                    //     console.log('stderr', stderr)
                    // }
                );
                const errors = [];

                // child.stdin.pipe(process.stdin)
                // child.stdout.pipe(process.stdout)
                // child.stderr.pipe(process.stderr)
                // console.log('===============')

                await waitForPort(child);
                // const port = await getPortFromConfig(dir)
                const port = require(path.resolve(dir, 'koot.config.js')).port;
                child.stderr.on('data', err => {
                    errors.push(err);
                });
                // console.log('port', port)

                // console.log({
                //     port,
                //     errors,
                // })
                expect(errors.length).toBe(0);

                await doPuppeteerTest(port, dist, {
                    kootConfig: require(path.resolve(dir, configFile)),
                    selectorForStoreEnhancer:
                        '#__test-store-enhancer-server-persist'
                });
                await terminate(child.pid);

                await afterTest(
                    dir,
                    '[prod] 使用 koot-start (--no-build) 命令启动服务器并访问'
                );
            });
            if (fullTest) {
                test(`[prod] 使用 koot-start (--no-build) 命令启动服务器并访问 (自定义端口号)`, async () => {
                    await beforeTest(dir);

                    const dist = path.resolve(dir, 'dist');
                    const configFile = `koot.config.js`;
                    const port = '8316';
                    const commandName = `${commandTestBuild}-isomorphic-start-server-custom-port`;
                    const command = `koot-start --no-build --port ${port} --koot-test`;
                    await addCommand(commandName, command, dir);

                    const child = execSync(
                        `npm run ${commandName}`,
                        {
                            cwd: dir
                        }
                        // (err, stdout, stderr) => {
                        //     console.log('err', err)
                        //     console.log('stdout', stdout)
                        //     console.log('stderr', stderr)
                        // }
                    );
                    const errors = [];

                    // child.stdin.pipe(process.stdin)
                    // child.stdout.pipe(process.stdout)
                    // child.stderr.pipe(process.stderr)
                    child.stderr.on('data', err => {
                        errors.push(err);
                    });

                    // console.log(111)
                    await waitForPort(child);
                    // console.log(222)

                    // console.log({
                    //     port,
                    //     errors,
                    // })
                    expect(errors.length).toBe(0);

                    await doPuppeteerTest(port, dist, {
                        kootConfig: require(path.resolve(dir, configFile)),
                        selectorForStoreEnhancer:
                            '#__test-store-enhancer-server-persist'
                    });
                    await terminate(child.pid);

                    await afterTest(
                        dir,
                        '[prod] 使用 koot-start (--no-build) 命令启动服务器并访问 (自定义端口号)'
                    );
                });
                test(`[prod] 使用打包后的执行文件启动服务器并访问`, async () => {
                    await beforeTest(dir);

                    const configFile = `koot.config.js`;
                    const cwd = path.resolve(dir, 'dist');
                    const child = execSync(
                        `node ${path.resolve(cwd, 'index.js')}`,
                        {
                            cwd
                        }
                    );
                    const errors = [];

                    await waitForPort(child);
                    // const port = await getPortFromConfig(dir)
                    const port = require(path.resolve(dir, 'koot.config.js'))
                        .port;
                    child.stderr.on('data', err => {
                        errors.push(err);
                    });

                    // console.log({
                    //     port,
                    //     errors,
                    // })
                    expect(errors.length).toBe(0);

                    await doPuppeteerTest(port, cwd, {
                        kootConfig: require(path.resolve(dir, configFile)),
                        selectorForStoreEnhancer:
                            '#__test-store-enhancer-server-persist'
                    });
                    await terminate(child.pid);

                    await emptyDist(cwd);
                    await afterTest(
                        dir,
                        '[prod] 使用打包后的执行文件启动服务器并访问'
                    );
                });

                testDevelopment(
                    '标准',
                    dir,
                    'koot.config.js',
                    'isomorphic-standard',
                    {
                        selectorForStoreEnhancer:
                            '#__test-store-enhancer-server-persist'
                    }
                );

                testFull(
                    'i18n.use="router"',
                    dir,
                    'koot.config.i18n-use-router.js',
                    'isomorphic-i18n_use_router',
                    {
                        i18nUseRouter: true
                    }
                );

                testFull(
                    'bundleVersionsKeep=false',
                    dir,
                    'koot.config.no-bundles-keep.js',
                    'isomorphic-no_bundles_keep'
                );

                testFull(
                    '0.6版配置',
                    dir,
                    'koot.config.old-0.6.js',
                    'isomorphic-config_old_0.6'
                );
            }
        });
    }
});

// TODO: 打包结果的独立测试，打包结果需要在其他的独立目录中

// TODO: render-template 传入的值，扩展

// TODO: client before 确保可以使用 async 方法

/** TODO: 热更新测试
 * - 修改 ejs
 * - 修改 css
 * - 修改 react 组件
 * - 修改 extend 传入信息
 */
