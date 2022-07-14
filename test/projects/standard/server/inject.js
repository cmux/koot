export default {
    performanceInfos: () => `<!-- rendered: ${new Date().toISOString()} -->`,
    spaInjectTest: () => {
        if (__SPA__) {
            return (
                `<!--:::KOOT:::TEST:::` +
                require('koot/utils/get-client-file-path')('specialEntry.js') +
                require('koot/utils/read-client-file')('specialEntry.js') +
                `-->`
            );
        }
    },
    testInjectCTX: (template, state, ctx) => (__SPA__ ? '' : ctx.path),
    __kootTestBuildCache: () => {
        // console.log('process.env.__KOOT_TEST_BUILD_CACHE__', process.env.__KOOT_TEST_BUILD_CACHE__);
        if (typeof process.env.__KOOT_TEST_BUILD_CACHE__ !== 'string')
            return '';
        return `<div id="__koot-test-build-cache" style="display:none">${process.env.__KOOT_TEST_BUILD_CACHE__}<div>`;
    },
};
