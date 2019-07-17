const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const ignoredStatus = [302, 304];
const largeFileThreshold = 300 * 1024; // 300KB

/**
 * 利用爬虫尝试访问站点内的所有链接，检测以下内容
 * -   损坏的链接
 * -   文件尺寸过大的请求 (如图片、JS 代码等)
 * -   HTML、CSS、JS 没有 gzip 的请求
 * -   页面载入过程中的报错
 * @async
 * @param {string} urlEntry
 * @return {Promise<Array<Object>>}
 */
const kootAnalyzeCrawler = async urlEntry => {
    const errors = [];
    const errObj = {};
    const browser = await puppeteer.launch();
    const startUrl = new URL(urlEntry);
    const urls = {
        visited: [],
        toVisit: [startUrl.href]
    };

    /**
     * 将 URL 添加至访问队列中
     * @param {string} url
     * @void
     */
    const addUrl = _url => {
        const url = new URL(_url, startUrl.origin);
        if (urls.visited.includes(url.href) || urls.toVisit.includes(url.href))
            return;
        urls.toVisit.push(url.href);
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
                        msg: `request \`${res.url()}\` should be Gzip`
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
                default: {
                    return '';
                }
            }
        })();
        if (isErrorExist(type, msg)) return;
        errors.push(
            Object.assign(
                new Error(msg),
                {
                    type,
                    res,
                    url: res.url(),
                    pageUrl
                },
                r
            )
        );
    };

    const crawl = async (url = urls.toVisit[0]) => {
        console.log(`visiting: ${url}`);

        const checkResponse = async res => {
            if (ignoredStatus.includes(res.status())) return;
            if (!res.ok())
                return addError('broken request', res, { pageUrl: url });

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
                    addError('no gzip', res, { pageUrl: url });
                }
            }

            if (contentLength && parseInt(contentLength) > largeFileThreshold) {
                addError('large file', res, {
                    pageUrl: url,
                    contentLength: parseInt(contentLength)
                });
            }
        };

        const context = await browser.createIncognitoBrowserContext();
        const page = await context.newPage();
        const res = await page
            .on('response', checkResponse)
            .goto(url, {
                waitUntil: 'networkidle2'
            })
            .catch(e => {
                addError(e);
            });

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

        // 将 url 从 toVisit 移动到 visited
        urls.visited.push(url);
        urls.toVisit.splice(urls.toVisit.indexOf(url), 1);

        if (urls.toVisit.length) return await crawl(urls.toVisit[0]);
        return errors;
    };

    const result = await crawl(startUrl.href);
    await browser.close();

    result.forEach(e => {
        const { type } = e;
        if (!errObj[type]) errObj[type] = [];
        errObj[type].push(e);
    });

    return errObj;
};

module.exports = kootAnalyzeCrawler;
