const puppeteer = require('puppeteer');

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

    const startUrl = new URL(urlEntry);

    const browser = await puppeteer.launch({
        headless: false
    });
    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();

    await page.goto(urlEntry, {
        waitUntil: 'networkidle2'
    });

    const randomClick = async () => {
        if (Date.now() - timeStart > timeMax) return;

        let err;
        const [response] = await Promise.all([
            page.waitForNavigation({
                timeout: 5000,
                waitUntil: 'networkidle2'
            }),
            page.evaluate(urlEntry => {
                const els = document.querySelectorAll('a[href], button');
                if (!els) throw new Error('NO_MATCH');
                const e = [...els].filter(e => {
                    const href = e.getAttribute('href');
                    if (href) {
                        const startUrl = new URL(urlEntry);
                        const url = new URL(href, startUrl.origin);
                        if (url.origin !== startUrl.origin) return false;
                    }
                    return true;
                });
                console.log(e);
                if (!e.length) throw new Error('NO_MATCH');
                const index = Math.floor(Math.random() * Math.floor(e.length));
                e[index].click();
            }, urlEntry)
        ]).catch(e => (err = e));

        if (err) {
            console.log(err);
            return await randomClick();
        }

        if (!response) {
            return await randomClick();
        }

        if (!response.ok() && !ignoredStatus.includes(response.status())) {
            await page.goBack({
                waitUntil: 'networkidle2'
            });
            return await randomClick();
        }

        return await randomClick();
    };
    await randomClick();

    await browser.close();
};

//

module.exports = kootAnalyzeMemory;
