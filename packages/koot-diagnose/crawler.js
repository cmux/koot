// const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { Cluster } = require('puppeteer-cluster');

/** 忽略的 HTTP code */
const ignoredStatus = [301, 302, 304];
/** 大文件尺寸阈值 */
const largeFileThreshold = 300 * 1024; // 300KB
/** 相似地址次数阈值 */
// const similarCountThreshold = 10;

/**
 * 利用爬虫尝试访问站点内的所有链接，检测以下内容
 * -   损坏的链接
 * -   文件尺寸过大的请求 (如图片、JS 代码等)
 * -   HTML、CSS、JS 没有 gzip 的请求
 * -   页面载入过程中的报错
 * @async
 * @param {string} urlEntry
 * @param {Object} [options={}]
 * @param {Number} [options.maxCrawl] 最多访问的页面数量
 * @param {Object} [options.cluster] puppeteer-cluster 选项
 * @return {Promise<Object>}
 */
const crawler = async (urlEntry, options = {}) => {
    const {
        // debug = false,
        maxCrawl = undefined,
        cluster: clusterOptions = {}
    } = options;
    const errors = [];
    const errObj = {};
    // let browser = await puppeteer.launch();
    // let context;
    // let page;
    let startUrl;
    let crawlCount = 0;
    const urls = {
        visited: [],
        queue: []
    };
    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: 2,
        ...clusterOptions
    });

    /**
     * 将 URL 添加至访问队列中。外站地址会被忽略
     * @param {string} url
     * @void
     */
    const addUrl = (_url, base = startUrl.origin) => {
        const url = new URL(_url, base);
        const allUrls = urls.visited.concat(urls.queue);

        // 如果已经访问过或在访问队列中，忽略
        if (allUrls.includes(url.href)) return;
        // 如果是外站地址，忽略
        if (url.origin !== startUrl.origin) return;
        // 如果相似的地址出现过多次，忽略
        // {
        //     const segs = url.pathname.split('/');
        //     const similarCount = allUrls.reduce((count, existUrl) => {
        //         (new URL(existUrl)).pathname.split('/');
        //         return count;
        //     }, 0);
        //     if (similarCount > similarCountThreshold) return;
        // }

        if (!maxCrawl || crawlCount < maxCrawl) {
            crawlCount++;
            urls.queue.push(url.href);
            cluster.queue(url.href);
        }
    };

    /**
     * 将错误添加至结果队列中
     * @param {*} type
     * @param {*} res
     * @param {*} pageUrl
     */
    const addError = (type, res, infos = {}) => {
        const { pageUrl } = infos;
        const isErrorExist = (type, msg) =>
            errors.some(e => e.message === msg && e.type === type);
        if (type instanceof Error) {
            const error = type;
            infos = res || {};
            const { pageUrl } = infos;
            const { msg, type: _type, url } = (() => {
                let matches;
                if (
                    (matches = /^net::(.+?) at (.+)$/.exec(error.message)) &&
                    matches.length &&
                    matches.length > 2
                ) {
                    return {
                        msg: `request \`${matches[2]}\` broken (net::${
                            matches[1]
                        })`,
                        url: matches[2],
                        type: 'broken request'
                    };
                }
                switch (error.message) {
                    default: {
                        return {
                            type: `common error`,
                            msg: error.message
                        };
                    }
                }
            })();
            if (isErrorExist(_type, msg)) return;
            errors.push(
                // Object.assign(new Error(msg), {
                //     type: _type,
                //     url,
                //     pageUrl
                // })
                {
                    message: msg,
                    type: _type,
                    url,
                    pageUrl
                }
            );
            return;
        }

        const { msg, ...r } = (() => {
            switch (type) {
                case 'broken request': {
                    return {
                        msg: `request \`${res.url()}\` broken (${res.status()} ${res.statusText()})`
                    };
                }
                case 'no gzip': {
                    return {
                        msg: `request \`${res.url()}\` should be Gzip`,
                        contentLength: infos.contentLength
                    };
                }
                case 'large file': {
                    return {
                        msg: `request \`${res.url()}\` is too large (≥ ${largeFileThreshold /
                            1024}KB)`,
                        threshold: largeFileThreshold,
                        contentLength: infos.contentLength
                    };
                }
                case 'console error': {
                    return {
                        msg: infos.consoleMsg.text(),
                        location: infos.consoleMsg.location()
                    };
                }
                default: {
                    return '';
                }
            }
        })();
        if (isErrorExist(type, msg)) return;
        const url = res ? res.url() : pageUrl || undefined;
        errors.push(
            Object.assign(
                // new Error(msg),
                {
                    message: msg,
                    type,
                    // res,
                    url,
                    pageUrl: url !== pageUrl ? pageUrl : undefined
                },
                r
            )
        );
    };

    const crawl = async (page, url = urls.queue[0]) => {
        // if (debug) console.log(`visiting: ${url}`);
        // try {
        //     await page.close();
        //     await context.close();
        // } catch (e) {}

        const checkResponse = async res => {
            if (ignoredStatus.includes(res.status())) return;

            const thisUrl = res.url();
            const pageUrl = thisUrl !== url ? url : undefined;

            if (!res.ok())
                return addError('broken request', res, {
                    pageUrl
                });

            if (new URL(thisUrl).origin !== new URL(pageUrl || url).origin)
                return;

            const headers = res.headers();
            const contentType =
                headers['content-type'] || headers['Content-Type'];
            const contentEncoding =
                headers['content-encoding'] || headers['Content-Encoding'];
            const contentLength =
                headers['content-length'] || headers['Content-Length'];

            if (
                /^text\//.test(contentType) ||
                /\/javascript$/.test(contentType) ||
                /\/css$/.test(contentType)
            ) {
                if (!/gzip/.test(contentEncoding)) {
                    return addError('no gzip', res, {
                        pageUrl,
                        contentLength: parseInt(contentLength)
                    });
                }
            }

            if (contentLength && parseInt(contentLength) > largeFileThreshold) {
                return addError('large file', res, {
                    pageUrl,
                    contentLength: parseInt(contentLength)
                });
            }
        };

        // context = await browser.createIncognitoBrowserContext();
        try {
            // page = await context.newPage();
            const res = await page
                .on('response', checkResponse)
                .on('console', msg => {
                    if (['error', 'trace'].includes(msg.type())) {
                        addError('console error', undefined, {
                            consoleMsg: msg,
                            pageUrl: url
                        });
                    }
                })
                .goto(url, {
                    waitUntil: 'networkidle2'
                })
                .catch(e => {
                    addError(e);
                    // return context.close();
                });

            if (!startUrl) {
                startUrl = new URL(page.url());
                url = startUrl.href;
                urls.queue.push(url);
            }

            if (res) {
                await checkResponse(res);

                const HTML = await res.text();
                const $ = cheerio.load(HTML);

                const selector = 'body a[href]';

                // add SSR links
                Object.values($(selector)).forEach(el => {
                    if (!el || !el.attribs) return;
                    try {
                        addUrl(el.attribs.href, page.url());
                    } catch (e) {
                        addError(e, { pageUrl: url });
                    }
                });

                // add CSR links
                (await page.$$eval(selector, links =>
                    links
                        .map(link => {
                            if (!link) return undefined;
                            const href = link.getAttribute('href');
                            return href;
                        })
                        .filter(url => !!url)
                )).forEach(href => {
                    try {
                        addUrl(href, page.url());
                    } catch (e) {
                        addError(e, { pageUrl: url });
                    }
                });
            }

            // await page.close();
            // await context.close();

            // 将 url 从 queue 移动到 visited
            urls.visited.push(url);
            urls.queue.splice(urls.queue.indexOf(url), 1);
        } catch (e) {
            console.error(e);
            // await page.close();
            // await context.close();
        }

        // if (urls.queue.length) return await crawl(urls.queue[0]);
        // return errors;
    };

    await cluster.task(async ({ page, data: url }) => {
        await crawl(page, url);
        // const screen = await page.screenshot();
        // Store screenshot, do something else
    });

    // await crawl(urlEntry);

    crawlCount++;
    cluster.queue(urlEntry);

    // await browser.close();
    await cluster.idle();

    // console.log(urls.queue);
    // while (urls.queue.length && (!maxCrawl || crawlCount < maxCrawl)) {
    //     urls.queue.forEach(url => cluster.queue(url));
    //     crawlCount++;
    //     await cluster.idle();
    // }

    await cluster.close();

    errors.forEach(e => {
        const { type } = e;
        if (!errObj[type]) errObj[type] = [];
        errObj[type].push(e);
    });

    return errObj;
};

module.exports = crawler;
