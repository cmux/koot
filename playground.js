import path from 'node:path';
import url from 'node:url';
import puppeteer from 'puppeteer';
import glob from 'glob-promise';

async function run() {
    // console.log(import.meta);
    // console.log(new URL(import.meta.url));
    // console.log(new URL('.', import.meta.url));
    // console.log(new URL('.cz-config.cjs', import.meta.url));
    // console.log(await import(new URL('.cz-config.cjs', import.meta.url)));
    console.log(
        url.fileURLToPath(new URL('packages/*/package.json', import.meta.url))
    );
    console.log(
        await glob(
            url.fileURLToPath(
                new URL('packages/*/package.json', import.meta.url)
            )
        )
    );
    // path.resolve(__dirname, 'packages/*/package.json')
    // const browser = await puppeteer.launch({
    //     // headless: false,
    // });
    // const context = await browser.createIncognitoBrowserContext();
    // const page = await context.newPage();
    // // const result = {
    // //     before: false,
    // //     after: false,
    // // };
    // page.on('console', (consoleMessage) => {
    //     console.log(consoleMessage.type(), consoleMessage.text());
    //     // if (msg.type() === 'log') {
    //     //     if (msg.text() === '__KOOT_TEST_CLIENT_BEFORE_SUCCESS__')
    //     //         result.before = true;
    //     //     if (msg.text() === '__KOOT_TEST_CLIENT_AFTER_SUCCESS__')
    //     //         result.after = true;
    //     // }
    // });
    // await page.goto('http://127.0.0.1:8980/', {
    //     waitUntil: 'networkidle2',
    // });
    // await page.close();
    // await context.close();
    // await browser.close();
}

run();
