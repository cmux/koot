const puppeteer = require('puppeteer');
const getUriFromChunkmap = require('../libs/get-uri-from-chunkmap');

/**
 * puppeteer 测试
 *
 * 针对 className 命名空间，测试对应元素的样式正确性
 *
 * @void
 * @param {*} page
 */
const styles = async page => {
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
            'f'
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
            el => {
                const styles = window.getComputedStyle(el);
                const attr = el.getAttribute('koot-test-styles');
                const check = {};
                const result = {};

                attr.split(';').forEach(str => {
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
                    result
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
    const tests = await page.evaluate(customEnv => {
        return Object.keys(customEnv).map(key => {
            const value = customEnv[key];
            const attr = `data-custom-env-${key}`;
            const el = document.querySelector(`[${attr}]`);
            return {
                check: value,
                result: el ? el.getAttribute(attr) : undefined
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
const injectScripts = async page => {
    //koot-test-scripts
    const result = await page.evaluate(() => {
        const container = document.querySelector('#koot-test-scripts');
        if (!container) {
            console.warn('`#koot-test-scripts` not found');
            return true;
        }
        return [...container.childNodes].every(
            node => node.tagName && node.tagName.toLowerCase() === 'script'
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
    let needToClose = !browser;

    if (!browser)
        browser = await puppeteer.launch({
            headless: true
        });

    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();
    const res = await page.goto(`${origin}/.hidden-picture.jpg`, {
        waitUntil: 'networkidle0'
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
    let needToClose = !browser;

    if (!browser)
        browser = await puppeteer.launch({
            headless: true
        });

    const uri = await getUriFromChunkmap(dist, 'client.js');
    expect(!!uri).toBe(true);

    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();
    const res = await page.goto(
        `${origin}${uri.substr(0, 1) === '/' ? '' : '/'}${uri}`,
        {
            waitUntil: 'domcontentloaded'
        }
    );
    const headers = res.headers();
    const text = await res.text();

    await context.close();
    if (needToClose) await browser.close();

    expect(headers['content-encoding']).toBe('gzip');
    expect(parseInt(headers['content-length']) <= text.length).toBe(true);
};

module.exports = {
    styles,
    customEnv,
    injectScripts,
    requestHidden404,
    criticalAssetsShouldBeGzip
};
