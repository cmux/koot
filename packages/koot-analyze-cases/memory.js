const puppeteer = require('puppeteer');
const sleep = require('./commons/sleep');

/** 忽略的 HTTP code */
const ignoredStatus = [302, 304];

/**
 * 在指定站点内随机的进行操作，持续一段较长的时间，检查内存占用情况
 * @async
 * @param {string} urlEntry
 * @param {number} [timeSeconds=600] 测试时长，单位：秒。默认600秒 (10分钟)
 * @param {boolean} [debug=true]
 * @return {Promise<Array<Object>>}
 */
const kootAnalyzeMemory = async (urlEntry, timeSeconds, debug = false) => {
    /** 开始时间戳 */
    const timeStart = Date.now();
    /** 最长运行时间 (ms) */
    const timeMax = timeSeconds * 1000;
    const result = [];

    let startOrigin;

    const browser = await puppeteer.launch({
        headless: false
    });
    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();

    await page.goto(urlEntry, {
        waitUntil: 'networkidle2'
    });

    /** 进行随机点击 */
    const randomClick = async () => {
        if (Date.now() - timeStart > timeMax) return;
        const currentUrl = page.url();
        if (!startOrigin) startOrigin = new URL(page.url()).origin;
        const o = {};

        try {
            let err;
            const [response] = await Promise.all([
                page.waitForNavigation({
                    timeout: 10 * 1000,
                    waitUntil: 'networkidle2'
                }),
                page.evaluate(
                    (startOrigin, o) => {
                        // const els = document.querySelectorAll('a[href], button');
                        const els = document.querySelectorAll('a[href]');
                        const base = document.querySelector('head base');
                        const baseTarget = base
                            ? base.getAttribute('target')
                            : '_self';
                        if (!els) throw new Error('NO_MATCH');
                        const e = [...els].filter(e => {
                            const href = e.getAttribute('href');
                            if (href) {
                                const url = new URL(href, window.location.href);
                                console.log({
                                    href,
                                    origin: url.origin,
                                    startOrigin
                                });
                                if (url.origin !== startOrigin) return false;

                                const target = e.getAttribute('target');
                                if (
                                    target === '_blank' ||
                                    (target && target !== '_self') ||
                                    (baseTarget !== '_self' &&
                                        target !== '_self')
                                )
                                    return false;

                                const current = new URL(window.location.href);
                                if (url.href === current.href) return false;
                                return true;
                            }
                            return false;
                        });
                        console.log(e);
                        if (!e.length) throw new Error('NO_MATCH');
                        const index = Math.floor(
                            Math.random() * Math.floor(e.length)
                        );
                        console.log(
                            index,
                            `| ${e[index].getAttribute('href')} |`,
                            e[index]
                        );
                        o.next = new URL(
                            e[index].getAttribute('href'),
                            window.location.href
                        ).href;
                        e[index].click();
                    },
                    startOrigin,
                    o
                )
            ]).catch(e => (err = e));
            await sleep(1000);

            // 如果出现错误，直接再次进行随机点击
            // 如果正常的进入了新页面，进行统计后再进行随机点击

            const getMetricsThenRandomClick = async () => {
                const newUrl = page.url();
                const {
                    JSHeapUsedSize,
                    JSHeapTotalSize
                } = await page.metrics();
                result.push({
                    prevUrl: currentUrl,
                    newUrl,
                    JSHeapUsedSize,
                    JSHeapTotalSize
                });

                return await randomClick();
            };

            if (err) {
                console.log(err);
                return await randomClick();
            }

            if (!response) {
                return await getMetricsThenRandomClick();
            }

            if (!response.ok() && !ignoredStatus.includes(response.status())) {
                await page.goBack({
                    waitUntil: 'networkidle2'
                });
                return await randomClick();
            }

            return await getMetricsThenRandomClick();
        } catch (e) {
            if (!o.next) {
                await page.goBack({
                    waitUntil: 'networkidle2'
                });
                return await randomClick();
            }
            console.log(e, o);
            return await randomClick();
        }
    };
    await randomClick();

    await browser.close();

    return result;
};

//

module.exports = kootAnalyzeMemory;
