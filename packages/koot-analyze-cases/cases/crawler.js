const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

/** 忽略的 HTTP code */
const ignoredStatus = [302, 304];
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
 * @param {boolean} [debug=true]
 * @return {Promise<Array<Object>>}
 */
const kootAnalyzeCrawler = async (urlEntry, debug = false) => {
    const errors = [];
    const errObj = {};
    const browser = await puppeteer.launch();
    let startUrl;
    const urls = {
        visited: [],
        queue: []
    };

    /**
     * 将 URL 添加至访问队列中。外站地址会被忽略
     * @param {string} url
     * @void
     */
    const addUrl = _url => {
        const url = new URL(_url, startUrl.origin);
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

        urls.queue.push(url.href);
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
            infos = res;
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
                            msg: error.message
                        };
                    }
                }
            })();
            if (isErrorExist(_type, msg)) return;
            errors.push(
                Object.assign(new Error(msg), {
                    type: _type,
                    url,
                    pageUrl
                })
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
                new Error(msg),
                {
                    type,
                    res,
                    url,
                    pageUrl: url !== pageUrl ? pageUrl : undefined
                },
                r
            )
        );
    };

    const crawl = async (url = urls.queue[0]) => {
        if (debug) console.log(`visiting: ${url}`);

        const checkResponse = async res => {
            if (ignoredStatus.includes(res.status())) return;

            const pageUrl = res.url() !== url ? url : undefined;

            if (!res.ok())
                return addError('broken request', res, {
                    pageUrl
                });

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

        const context = await browser.createIncognitoBrowserContext();
        const page = await context.newPage();
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
            });

        if (!startUrl) {
            startUrl = new URL(url);
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
                addUrl(el.attribs.href);
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
            )).forEach(addUrl);
        }

        await context.close();

        // 将 url 从 queue 移动到 visited
        urls.visited.push(url);
        urls.queue.splice(urls.queue.indexOf(url), 1);

        if (urls.queue.length) return await crawl(urls.queue[0]);
        return errors;
    };

    const result = await crawl(urlEntry);
    await browser.close();

    result.forEach(e => {
        const { type } = e;
        if (!errObj[type]) errObj[type] = [];
        errObj[type].push(e);
    });

    return errObj;
};

module.exports = kootAnalyzeCrawler;
