const fs = require('fs-extra');
const path = require('path');
const puppeteer = require('puppeteer');

const {
    buildManifestFilename
} = require('../packages/koot/defaults/before-build');

const origin = 'http://localhost:8080/';
const dist = path.resolve(__dirname, '../test/projects/standard/dist-spa-test');

const getUriFromChunkmap = async file => {
    const chunkmap = await fs.readJson(
        path.resolve(dist, buildManifestFilename)
    );
    const getMap = (map = chunkmap) => {
        if (
            typeof map['.entrypoints'] === 'object' &&
            typeof map['.files'] === 'object'
        )
            return map;

        const keys = Object.keys(map);

        if (!keys.length) return {};

        return getMap(map[keys[0]]);
    };
    const map = getMap();
    const p = map['.public'] || '';
    const files = map['.files'] || {};

    if (files[file]) return files[file].replace(new RegExp(`^${p}`), '');

    return '';
};

(async () => {
    const uri = await getUriFromChunkmap('client.js');
    console.log({ uri });

    const browser = await puppeteer.launch();
    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();

    const res = await page.goto(origin + uri, {
        waitUntil: 'networkidle0'
    });
    const headers = res.headers();
    // const json = await res.json();

    console.log({
        'content-encoding': headers['content-encoding'],
        'content-length': headers['content-length'],
        length: (await res.text()).length
        // json
    });

    await browser.close();
})();
