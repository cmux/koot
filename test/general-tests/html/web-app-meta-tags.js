import path from 'node:path';
import fs from 'fs-extra';
import cheerio from 'cheerio';

import getOutput from '../../libs/get-output-dir-from-manifestmap.js';

/**
 * 测试：WebApp 相关 <meta> 标签信息以及文件可用性
 */
const webAppMetaTags = async (html, dist) => {
    if (!dist) throw new Error('no "dist"');
    if (!fs.existsSync(dist)) throw new Error('"dist" not exists');

    const outputDir = await getOutput(dist);

    // 根目录下存在 favicon.ico
    expect(fs.existsSync(path.resolve(outputDir, 'favicon.ico'))).toBe(true);

    /** cheerio */
    const $ = cheerio.load(html);

    const testMetaTagAndHref = (selector) => {
        const tag = $(selector);
        expect(tag.length).toBe(1);
    };
    testMetaTagAndHref('link[rel="shortcut icon"]');
    testMetaTagAndHref('link[rel="manifest"]');

    // 测试所有带 href 的 <meta>
    const tags = $('head link[href]');
    for (let i = 0; i < tags.length; i++) {
        const href = $(tags[i]).attr('href');
        // console.log(i);
        // console.log(href);
        // console.log(path.resolve(outputDir, href.replace(/^\//, '')));
        // console.log(
        //     fs.existsSync(path.resolve(outputDir, href.replace(/^\//, '')))
        // );
        expect(typeof href).toBe('string');
        expect(href).not.toBe('');
        expect(
            fs.existsSync(path.resolve(outputDir, href.replace(/^\//, '')))
        ).toBe(true);
    }
};

export default webAppMetaTags;
