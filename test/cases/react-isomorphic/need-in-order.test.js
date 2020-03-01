/**
 * React SSR 完全测试
 *
 * 不同的 Koot 配置会分别使用不同的配置，用以测试多种结果。以下是已有的案例
 *
 * **store**
 * - 默认
 *     - 提供创建 store 的方法
 *     - 使用 koot 封装的 createStore 方法
 *     - 提供的 reducer 是 Object
 *     - 提供 enhancer
 * - 二号
 *     - 提供创建 store 的方法
 *     - 使用 koot 封装的 createStore 方法
 *     - 提供的 reducer 是 Function
 * - 三号
 *     - 提供创建 store 的方法
 *     - 使用自定函数
 * - 0.6版配置
 *     - 仅提供 reducer 列表
 *
 * **cookiesToStore**
 * - 默认: `true`
 * - 二号: `"all"`
 * - 三号: `['kootTest2', 'kootTest3']`
 * - 0.6版配置: `false`
 *
 * **sessionStore**
 * - 默认
 *     - `true` (全部开启)
 * - 二号
 *     - `"all"` (全部开启)
 * - 三号
 *     - 部分开启，同时混入无效设置
 * - 0.6版配置
 *     - 禁用
 *
 * **distClientAssetsDirName**
 * - 默认
 *     - 没有配置 (默认 `includes`)
 * - 二号
 *     - `"__assets__"`
 *
 * 四号：调整了 Webpack 配置的 `output.publicPath`。其他内容同默认
 */

// Import modules =============================================================

const fs = require('fs-extra');
const path = require('path');
const util = require('util');
const execSync = require('child_process').exec;
const exec = util.promisify(require('child_process').exec);
const puppeteer = require('puppeteer');
const chalk = require('chalk');
const get = require('lodash/get');
const cheerio = require('cheerio');

// Import local scripts =======================================================

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
const getProjects = require('../../projects/get');
const ensureUrlTrailingSlash = require('../../../packages/koot/utils/ensure-url-trailing-slash');

const {
    injectScripts: puppeteerTestInjectScripts,
    requestHidden404: testRequestHidden404,
    criticalAssetsShouldBeGzip: testAssetsGzip,
    clientLifecycles: testClientLifecycles
} = require('../puppeteer-test');

// Constants ==================================================================

global.kootTest = true;
process.env.KOOT_TEST_MODE = JSON.stringify(true);

const projects = getProjects();
const projectsToUse = projects.filter(
    project =>
        // Array.isArray(project.type) && project.type.includes('react-isomorphic')
        project.name === 'standard'
);

const commandTestBuild = 'koot-buildtest';
/** @type {Boolean} 是否进行完整测试。如果为否，仅测试一次打包结果 */
const fullTest = true;
const headless = true;

// Jest configuration =========================================================

jest.setTimeout(10 * 60 * 1 * 1000);

let browser;
let lastTime;

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
beforeEach(() => (lastTime = Date.now()));

// Wrapped test function ======================================================

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
    const testName = `[prod] 打包并运行生产环境 (${name})`;
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

        await testFilesFromChunkmap(dist, false);
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
    const testName = `[dev] 启动开发环境并访问 (${name})`;
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

    // eslint-disable-next-line no-console
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
        selectorForStoreEnhancer,
        cookiesToStore
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

    const getSSRStateFromScriptTag = async page =>
        await page.evaluate(() => {
            const scripts = [...document.querySelectorAll('script')];
            const regex = /^window.__REDUX_STATE__\s*=\s*(.+?)[;$]/m;
            const s = scripts.filter(el => regex.test(el.innerText));
            if (!s.length) return '';

            const str = s[0].innerText;
            const match = regex.exec(str);

            if (match.length < 2) return '';

            let result;
            try {
                result = JSON.parse(match[1]);
            } catch (e) {
                // eslint-disable-next-line no-eval
                result = eval(match[1]);
            }
            return result;
        });

    const page = await context.newPage();
    const failedResponse = [];
    require('../../libs/puppeteer/page-event-response-failed-response')(
        page,
        failedResponse
    );

    /** 等待开发服务器喘息 */
    const breath = async () => {
        if (isDev) return await sleep(2 * 1000);
        else return;
    };

    const defaultWaitUtil = isDev ? 'networkidle2' : 'domcontentloaded';

    // 测试: 页面基本结构
    {
        const res = await page
            .goto(origin, {
                waitUntil: defaultWaitUtil
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
            if (err) console.error(err);
            expect(typeof err).toBe('undefined');
        }

        // 测试: inject 传入 ctx
        {
            const value = await page.evaluate(
                () => document.getElementById('inject-ctx-test').innerText
            );
            if (i18nUseRouter) expect(/^\/.+?\//.test(value)).toBe(true);
            else expect(value).toBe('/');
        }

        // 测试: SSR state 转义与自动反转义
        {
            const SSRState = await getSSRState(page);
            expect(SSRState.kootTest.testNeedEncode).toBe('test</script>');
        }
    }

    // 测试: 利用 URL 可切换到对应语种，并且 SSR 数据正确
    {
        await breath();

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
                waitUntil: defaultWaitUtil
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

            // 测试: inject 传入 ctx
            {
                const value = await page.evaluate(
                    () => document.getElementById('inject-ctx-test').innerText
                );
                expect(value).toBe(
                    i18nUseRouter ? `/${localeId}/extend` : '/extend'
                );
            }

            // 测试: SSR beforePreRender() 生命周期
            expect($('#__test-ssr-lifecycle-before-pre-render').text()).toBe(
                '__TEST_BEFORE_PRE_RENDER__'
            );
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
        await breath();

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
                waitUntil: defaultWaitUtil
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
        await breath();

        await Promise.all([
            new Promise(async resolve => {
                const pageDelayed = await context.newPage();
                const localeIdDelayed = 'en';
                const gotoUrlDelayed = i18nUseRouter
                    ? `${origin}/${localeIdDelayed}/delayed`
                    : `${origin}/delayed?${changeLocaleQueryKey}=${localeIdDelayed}`;
                await pageDelayed.goto(gotoUrlDelayed, {
                    waitUntil: defaultWaitUtil
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
                    waitUntil: defaultWaitUtil
                });
                const theLocaleId = await getLocaleId(page);
                expect(theLocaleId).toBe(localeId);
                resolve();
            })
        ]);
    }

    // 测试: 访问没有指定组件的路由
    {
        await breath();

        const name = 'testtesttest';

        // 先测试父级路由
        const urlParent = `${origin}/static`;
        await page
            .goto(urlParent, {
                waitUntil: defaultWaitUtil
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
        await breath();

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
        await breath();

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
        await breath();

        const pageTS = origin + '/ts';
        await page.goto(pageTS, {
            waitUntil: defaultWaitUtil
        });
        const el = await page.$('[data-koot-test-page="page-ts"]');
        expect(el).not.toBe(null);
    }

    // 测试：extend 高阶组件的 SSR 控制
    {
        await breath();

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
        await breath();

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
        await breath();

        const getValue = async () => {
            const context = await browser.createIncognitoBrowserContext();
            const page = await context.newPage();
            const res = await page.goto(origin, {
                waitUntil: defaultWaitUtil
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
        await breath();

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
                waitUntil: defaultWaitUtil
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

    // 测试: 非匹配的组件，其相 store 关函数不应运行
    {
        await breath();

        const context = await browser.createIncognitoBrowserContext();
        const page = await context.newPage();
        const test = async (url = origin, toHasValue = false) => {
            await page.goto(url, {
                waitUntil: defaultWaitUtil
            });

            const SSRState = await getSSRStateFromScriptTag(page);

            expect(!!SSRState.testModifyState).toBe(toHasValue);
        };

        await test(origin, false);
        await test(origin + `/test-modify-state`, true);
        await test(origin, false);

        await context.close();
    }

    // 测试: cookiesToStore
    if (typeof cookiesToStore !== 'undefined') {
        await breath();

        /**
         *
         * - 默认: `true`
         * - 二号: `"all"`
         * - 三号: `['kootTest2']`
         * - 0.6版配置: `false`
         */
        await page.goto(origin, {
            waitUntil: defaultWaitUtil
        });

        const { server: SSRStateServer = {} } = await getSSRStateFromScriptTag(
            page
        );
        const { cookie: result } = SSRStateServer;
        const validResult = {
            kootTest: 'valueForKootTest',
            kootTest2: 'valueForKootTest2',
            kootTest3: 'koot=koot==koot==='
        };

        if (cookiesToStore === true) {
            expect(typeof result).toBe('string');
            for (const [key, value] of Object.entries(validResult)) {
                const regexp = new RegExp(
                    `(^|\\s|;)${key}\\s*=\\s*${value}`,
                    'g'
                );
                const testResult = regexp.test(result);
                if (!testResult) {
                    console.error({
                        result,
                        regexp,
                        testResult
                    });
                    return;
                }
                expect(testResult).toBe(true);
            }
        } else if (cookiesToStore === false) {
            expect(typeof result).toBe('undefined');
        } else {
            expect(typeof result).toBe('object');
            if (Array.isArray(cookiesToStore)) {
                for (const key of cookiesToStore) {
                    expect(typeof result[key]).not.toBe('undefined');
                    expect(result[key]).toBe(validResult[key]);
                }
            } else if (cookiesToStore === 'all') {
                for (const [key, value] of Object.entries(validResult)) {
                    expect(result[key]).toBe(value);
                }
            }
        }
    }

    // 测试: SSR Store 路由信息
    {
        const pathname = '/extend';
        const search = '?a=1';

        const context = await browser.createIncognitoBrowserContext();
        const page = await context.newPage();
        await page.goto(`${origin}${pathname}${search}`, {
            waitUntil: defaultWaitUtil
        });

        const {
            routing: { locationBeforeTransitions: L }
        } = await getSSRStateFromScriptTag(page);

        await context.close();

        expect(
            i18nUseRouter
                ? '/' +
                      L.pathname
                          .split('/')
                          .slice(2)
                          .join('/')
                : L.pathname
        ).toBe(pathname);
        // expect(L.pathname).toBe(pathname);
        expect(L.search).toBe(search);
    }

    // 测试: i18n / 多语言
    {
        await breath();

        const toLocaleId = 'zh';
        const gotoUrl = i18nUseRouter
            ? `${origin}/${toLocaleId}`
            : `${origin}?${changeLocaleQueryKey}=${toLocaleId}`;

        const context = await browser.createIncognitoBrowserContext();
        const page = await context.newPage();

        const res = await page.goto(gotoUrl, {
            waitUntil: 'networkidle0'
        });

        const HTML = await res.text();
        const $ = cheerio.load(HTML);

        {
            const selector = `h1 ~ a[href="${
                i18nUseRouter ? `/${toLocaleId}` : ''
            }/"]`;
            const result = '欢迎';
            expect($(selector).text()).toBe(result);
            expect(
                await page.evaluate(
                    selector => document.querySelector(selector).innerText,
                    selector
                )
            ).toBe(result);
        }

        if (!isDev) {
            const chunkmap = await fs.readJson(
                path.resolve(dist, '.public-chunkmap.json')
            );
            const pathname = path.resolve(
                dist,
                chunkmap[`.${toLocaleId}`]['.files']['client.js']
            );
            const content = await fs.readFile(pathname, 'utf-8');
            expect(
                /__KOOT_TEST_LOCALE_TRANSLATE_FUNCTION_ONLY_RESULT__\|\|[^(]+?\(['"]\/test-img-zh\.png['"]/.test(
                    content
                )
            ).toBe(true);
        }

        await context.close();
    }

    // 测试: 服务器端获取 koa ctx
    {
        const context = await browser.createIncognitoBrowserContext();
        const page = await context.newPage();
        const gotoUrl = i18nUseRouter
            ? `${origin}/zh/test-server-ctx-redirect`
            : `${origin}/test-server-ctx-redirect`;

        await page.goto(gotoUrl, {
            waitUntil: 'networkidle0'
        });
        const result = await page.evaluate(() => window.location.href);

        await context.close();

        if (i18nUseRouter) {
            expect(ensureUrlTrailingSlash(origin + '/zh')).toBe(
                ensureUrlTrailingSlash(result)
            );
        } else {
            expect(ensureUrlTrailingSlash(origin)).toBe(
                ensureUrlTrailingSlash(result)
            );
        }
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
    await testClientLifecycles(origin, browser);

    // 测试: 没有失败的请求
    const failedResponseFiltered = failedResponse.filter(
        res => !/\/sockjs-node\//.test(res.url())
    );
    if (failedResponseFiltered.length) {
        console.error(
            'failedResponse',
            failedResponseFiltered.map(res => ({
                status: res.status(),
                url: res.url()
            }))
        );
    }
    expect(failedResponseFiltered.length).toBe(0);

    // 结束测试
    await page.close();
    await context.close();

    return;
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

                await testFilesFromChunkmap(dist, false);
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
                        '#__test-store-enhancer-server-persist',
                    cookiesToStore: true
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
                            '#__test-store-enhancer-server-persist',
                        cookiesToStore: true
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
                            '#__test-store-enhancer-server-persist',
                        cookiesToStore: true
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
                            '#__test-store-enhancer-server-persist',
                        cookiesToStore: true
                    }
                );

                testFull(
                    '二号 / i18n.use="router"',
                    dir,
                    'koot.config.i18n-use-router.js',
                    'isomorphic-i18n_use_router',
                    {
                        i18nUseRouter: true,
                        cookiesToStore: 'all'
                    }
                );

                testFull(
                    '三号 / bundleVersionsKeep=false',
                    dir,
                    'koot.config.no-bundles-keep.js',
                    'isomorphic-no_bundles_keep',
                    {
                        cookiesToStore: ['kootTest2', 'kootTest3']
                    }
                );

                testFull(
                    '四号 / output.publicPath',
                    dir,
                    'koot.config.public-path.js',
                    'isomorphic-public_path'
                );

                testFull(
                    '0.6版配置',
                    dir,
                    'koot.config.old-0.6.js',
                    'isomorphic-config_old_0.6',
                    {
                        cookiesToStore: false
                    }
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
