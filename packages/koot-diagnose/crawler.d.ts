interface CrawlerOptions {
    /** 最多访问的页面数量 */
    maxCrawl?: number;
    /** `puppeteer-cluster` 选项 */
    cluster?: {
        [option: string]: any;
    };
}
interface CrawlerError {
    /** 错误信息 */
    message?: string;
    /** 错误类型 */
    type?: string;
    /** 错误关联的 URL */
    url: string;
    /** 当前页面 URL (和错误 URL 不同时) */
    pageUrl?: string;
    /** 此次请求的长度 (单位: 字节) */
    contentLength?: number;
    [key: string]: any;
}

//

/**
 * 利用爬虫尝试访问站点内的所有链接，检测以下内容
 * -   损坏的链接
 * -   文件尺寸过大的请求 (如图片、JS 代码等)
 * -   HTML、CSS、JS 没有 gzip 的请求
 * -   页面载入过程中的报错
 */
async function crawler(
    entryURL: string,
    options?: CrawlerOptions
): Promise<{
    [errorType: string]: CrawlerError[];
}>;

export default crawler;
