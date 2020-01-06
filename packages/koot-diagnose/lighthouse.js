const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

function launchChromeAndRunLighthouse(url, opts, config = null) {
    return chromeLauncher
        .launch({ chromeFlags: opts.chromeFlags })
        .then(chrome => {
            opts.port = chrome.port;
            return lighthouse(url, opts, config).then(results => {
                // use results.lhr for the JS-consumeable output
                // https://github.com/GoogleChrome/lighthouse/blob/master/types/lhr.d.ts
                // use results.report for the HTML/JSON/CSV output as a string
                // use results.artifacts for the trace/screenshots/other specific case you need (rarer)
                return chrome.kill().then(() => results.lhr);
            });
        });
}

const defaults = {
    chromeFlags: ['--show-paint-rects']
};

/**
 * 进行一次灯塔 (Lighthouse) 基准测试和检测
 * @async
 * @param {string} urlEntry
 * @param {Object} [options={}] Lighthouse 配置对象
 * @param {boolean} [debug=true]
 * @return {Promise<Array<Object>>}
 */
const kootAnalyzeLighthouse = async (urlEntry, opts = {}, debug = false) => {
    const results = await launchChromeAndRunLighthouse(urlEntry, {
        ...defaults,
        ...opts
    });
    return results;
};

module.exports = kootAnalyzeLighthouse;
