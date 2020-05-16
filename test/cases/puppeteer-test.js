const fs = require('fs-extra');
const path = require('path');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const getUriFromChunkmap = require('../libs/get-uri-from-chunkmap');
const getLocaleIdFromPage = require('../libs/puppeteer/get-locale-id-from-page');
const getSSRStateFromPage = require('../libs/puppeteer/get-ssr-state-from-page');

const {
    changeLocaleQueryKey,
} = require('../../packages/koot/defaults/defines');
const {
    buildManifestFilename,
} = require('../../packages/koot/defaults/before-build');

// ============================================================================

/**
 * puppeteer 测试
 *
 * 针对 className 命名空间，测试对应元素的样式正确性
 *
 * @void
 * @param {*} page
 */
const styles = async (page) => {
    const tests = await page.evaluate(() => {
        var hexDigits = [
            '0',
            '1',
            '2',
            '3',
            '4',
            '5',
            '6',
            '7',
            '8',
            '9',
            'a',
            'b',
            'c',
            'd',
            'e',
            'f',
        ];
        //F unction to convert rgb color to hex format
        function rgb2hex(rgb) {
            rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            return '#' + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
        }
        function hex(x) {
            return isNaN(x)
                ? '00'
                : hexDigits[(x - (x % 16)) / 16] + hexDigits[x % 16];
        }
        return Array.from(document.querySelectorAll(`[koot-test-styles]`)).map(
            (el) => {
                const styles = window.getComputedStyle(el);
                const attr = el.getAttribute('koot-test-styles');
                const check = {};
                const result = {};

                attr.split(';').forEach((str) => {
                    const [_prop, ..._value] = str.trim().split(':');
                    const prop = _prop
                        .trim()
                        .split('-')
                        .reduce(
                            (result, cur) =>
                                result +
                                cur.substr(0, 1).toUpperCase() +
                                cur.substr(1)
                        );
                    check[prop] = _value.join('').trim();
                    result[prop] = /^rgb\([0-9, ]+?\)$/.test(styles[prop])
                        ? rgb2hex(styles[prop])
                        : styles[prop];
                });

                return {
                    check,
                    result,
                };
            }
        );
    });
    for (const test of tests) {
        const { check, result } = test;
        expect(check).toEqual(result);
    }
};

/**
 * puppeteer 测试
 *
 * 自定义环境变量
 *
 * @void
 * @param {*} page
 */
const customEnv = async (page, customEnv = {}) => {
    const tests = await page.evaluate((customEnv) => {
        return Object.keys(customEnv).map((key) => {
            const value = customEnv[key];
            const attr = `data-custom-env-${key}`;
            const el = document.querySelector(`[${attr}]`);
            return {
                check: value,
                result: el ? el.getAttribute(attr) : undefined,
            };
        });
    }, customEnv);
    for (const test of tests) {
        const { check, result } = test;
        expect(check).toEqual(result);
    }
};

/**
 * puppeteer 测试
 *
 * `inject.scripts` 内必须都是 script 节点
 *
 * @void
 * @param {*} page
 */
const injectScripts = async (page) => {
    //koot-test-scripts
    const result = await page.evaluate(() => {
        const container = document.querySelector('#koot-test-scripts');
        if (!container) {
            console.warn('`#koot-test-scripts` not found');
            return true;
        }
        return [...container.childNodes].every(
            (node) => node.tagName && node.tagName.toLowerCase() === 'script'
        );
    });
    expect(result).toBe(true);
};

/**
 * puppeteer 测试
 *
 * 访问隐藏文件返回 404
 */
const requestHidden404 = async (origin, browser) => {
    const needToClose = !browser;

    if (!browser)
        browser = await puppeteer.launch({
            headless: true,
        });

    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();
    const res = await page.goto(`${origin}/.hidden-picture.jpg`, {
        waitUntil: 'networkidle0',
    });

    await context.close();
    if (needToClose) await browser.close();

    expect(typeof res).toBe('object');
    expect(res.status()).toBe(404);
};

/**
 * puppeteer 测试
 *
 * 请求关键资源文件应为 gzip
 * @async
 * @param {string} origin
 * @param {string} dist
 * @param {Object} [browser]
 * @returns {Promise}
 */
const criticalAssetsShouldBeGzip = async (origin, dist, browser) => {
    const needToClose = !browser;

    if (!browser)
        browser = await puppeteer.launch({
            headless: true,
        });

    const uri = await getUriFromChunkmap(dist, 'client.js');
    expect(!!uri).toBe(true);

    const fullUrl = `${origin}${uri.substr(0, 1) === '/' ? '' : '/'}${uri}`;
    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();
    const res = await page.goto(fullUrl, {
        waitUntil: 'domcontentloaded',
    });
    const headers = res.headers();
    const text = await res.text();

    await context.close();
    if (needToClose) await browser.close();

    if (parseInt(headers['content-length']) > 50) {
        if (headers['content-encoding'] !== 'gzip') {
            console.warn(
                fullUrl,
                dist,
                parseInt(headers['content-length']),
                text.length
            );
        }
        expect(headers['content-encoding']).toBe('gzip');
        expect(parseInt(headers['content-length']) <= text.length).toBe(true);
    }
};

/**
 * puppeteer 测试
 *
 * 客户端生命周期: before 和 after
 * @async
 * @param {string} origin
 * @param {Object} [browser]
 * @returns {Promise}
 */
const clientLifecycles = async (origin, browser) => {
    const needToClose = !browser;
    if (!browser)
        browser = await puppeteer.launch({
            headless: true,
        });

    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();
    const result = {
        before: false,
        after: false,
    };
    page.on('console', (msg) => {
        if (msg.type() === 'log') {
            if (msg.text() === '__KOOT_TEST_CLIENT_BEFORE_SUCCESS__')
                result.before = true;
            if (msg.text() === '__KOOT_TEST_CLIENT_AFTER_SUCCESS__')
                result.after = true;
        }
    });
    await page.goto(origin, {
        waitUntil: 'networkidle0',
    });
    await context.close();
    if (needToClose) await browser.close();

    expect(result.before).toBe(true);
    expect(result.after).toBe(true);
};

/**
 * puppeteer 测试
 *
 * 多语言相关
 * - 当前语种是否正确
 * - 到其他语种的链接是否正确
 * - React 组件内字段是否正确渲染
 * - HTML 标题是否正确渲染
 * @async
 * @param {Object} options
 * @param {string} origin
 * @param {*} i18n koot 配置 i18n
 * @param {boolean} [isSPA=false]
 * @param {boolean} [isDev=false]
 * @param {Object} [browser]
 * @param {string} dist
 * @returns {Promise<void>}
 */
const i18n = async ({
    origin,
    browser,
    isDev = false,
    isSPA = false,
    i18n,
    cwd,
    dist,
}) => {
    const defaults = require('../../packages/koot/defaults/i18n');
    const defaultWaitUtil =
        isDev || isSPA ? 'networkidle2' : 'domcontentloaded';

    // 处理配置
    let useRouter = false;
    let cookieKey = defaults.cookieKey;
    const locales = {};
    const parseLocalesFromArray = (arr) => {
        for (const [localeId, o] of arr) {
            if (typeof o === 'object') locales[localeId] = o;
            else {
                const file = path.resolve(cwd, o);
                try {
                    locales[localeId] = require(file);
                } catch (e) {
                    locales[localeId] = fs.readJsonSync(file);
                }
            }
        }
    };
    if (Array.isArray(i18n)) {
        parseLocalesFromArray(i18n);
    } else if (typeof i18n === 'object') {
        if (!isSPA && i18n.use === 'router') useRouter = true;
        if (i18n.cookieKey) cookieKey = i18n.cookieKey;
        parseLocalesFromArray(i18n.locales);
    } else {
        return;
    }

    // 开始测试
    const needToClose = !browser;
    if (!browser)
        browser = await puppeteer.launch({
            headless: true,
        });

    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();

    // 跳转链接
    {
        /**
         * 测试目标语种
         * @param {String} localeId 语种ID
         * @param {Object} infos 测试目标值
         * @param {String} infos.title 页面标题
         * @param {String} infos.description 页面简介
         */
        const testTargetLocaleId = async (localeId, infos = {}) => {
            const route = isSPA ? '/static' : '/extend';
            const gotoUrl = useRouter
                ? `${origin}${isSPA ? '/#' : ''}/${localeId}${route}`
                : `${origin}${
                      isSPA
                          ? `/?${changeLocaleQueryKey}=${localeId}#${route}`
                          : `${route}?${changeLocaleQueryKey}=${localeId}`
                  }`;

            const res = await page.goto(gotoUrl, {
                waitUntil: defaultWaitUtil,
            });
            const HTML = await res.text();
            const $ = cheerio.load(HTML);

            // 测试语种 ID 正确
            const theLocaleId = await getLocaleIdFromPage(page);
            expect(theLocaleId).toBe(localeId);

            // 测试页面标题正确
            const pageTitle = await page.evaluate(
                () => document.querySelector('title').innerText
            );
            expect(new RegExp(`^${infos.title}`).test(pageTitle)).toBe(true);

            // 测试页面简介正确
            const pageDescription = await page.evaluate(
                () =>
                    document.querySelector('meta[description]') &&
                    document
                        .querySelector('meta[description]')
                        .getAttribute('description')
            );
            expect(pageDescription).toBe(infos.description);

            expect(
                await page.evaluate(
                    () =>
                        document.querySelector('#__test-locales-export-object')
                            .innerText
                )
            ).toBe(infos.exportObject);

            if (!isSPA) {
                // 测试 SSR Redux state 正确
                const SSRState = await getSSRStateFromPage(page);
                const SSRServerTime = await page.evaluate(
                    () =>
                        document.querySelector('.timestamp strong') &&
                        new Date(
                            document.querySelector(
                                '.timestamp strong'
                            ).innerText
                        ).getTime()
                );
                expect(typeof SSRState.infos.serverTimestamp).toBe('number');
                expect(SSRServerTime).toBe(SSRState.infos.serverTimestamp);

                // 测试 __() 输出为对象的情况
                expect($('#__test-locales-export-object').text()).toBe(
                    infos.exportObject
                );

                // 测试: inject 传入 ctx
                {
                    const value = await page.evaluate(
                        () =>
                            document.getElementById('inject-ctx-test').innerText
                    );
                    expect(value).toBe(
                        useRouter ? `/${localeId}/extend` : '/extend'
                    );
                }

                // 测试: SSR beforePreRender() 生命周期
                expect(
                    $('#__test-ssr-lifecycle-before-pre-render').text()
                ).toBe('__TEST_BEFORE_PRE_RENDER__');
            }
        };

        for (const [localeId, localeObj] of Object.entries(locales)) {
            await testTargetLocaleId(localeId, {
                title: localeObj.pages[isSPA ? 'static' : 'extend'].title,
                description:
                    localeObj.pages[isSPA ? 'static' : 'extend'].description,
                exportObject: localeObj.pages.home.title,
            });
        }
    }

    // 测试: i18n / 多语言
    {
        const toLocaleId = 'zh';
        const gotoUrl = useRouter
            ? `${origin}${isSPA ? '/#' : ''}/${toLocaleId}/`
            : `${origin}${
                  isSPA
                      ? `/?${changeLocaleQueryKey}=${toLocaleId}#/`
                      : `/?${changeLocaleQueryKey}=${toLocaleId}`
              }`;

        const context = await browser.createIncognitoBrowserContext();
        const page = await context.newPage();

        const res = await page.goto(gotoUrl, {
            waitUntil: 'networkidle0',
        });

        const HTML = await res.text();
        const $ = cheerio.load(HTML);

        {
            const selector = `h1 + a[href]`;
            const result = '欢迎';
            if (!isSPA) {
                expect($(selector).text()).toBe(result);
            }
            expect(
                await page.evaluate(
                    (selector) => document.querySelector(selector).innerText,
                    selector
                )
            ).toBe(result);
        }

        if (!isDev && !isSPA) {
            const chunkmap = await fs.readJson(
                path.resolve(dist, buildManifestFilename)
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

    await context.close();
    if (needToClose) await browser.close();
};

module.exports = {
    styles,
    customEnv,
    injectScripts,
    requestHidden404,
    criticalAssetsShouldBeGzip,
    clientLifecycles,
    i18n,
};
